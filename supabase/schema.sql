-- OFFGRID BETA: ejecutar una sola vez en el editor SQL de Supabase.
-- Las tablas no deben exponerse al cliente. Las rutas Next.js usan únicamente service_role en servidor.
create table if not exists public.catalog (
  id text primary key,
  data jsonb not null,
  price numeric(12,0) not null check (price >= 0),
  active boolean not null default true
);
create table if not exists public.inventory (
  product_id text not null references public.catalog(id) on delete cascade,
  color text not null,
  size text not null,
  quantity integer not null default 0 check (quantity >= 0),
  primary key (product_id, color, size)
);
create sequence if not exists public.offgrid_order_number;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  request_key uuid not null unique,
  request_fingerprint text not null,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric(12,0) not null,
  delivery_cost numeric(12,0) not null,
  total numeric(12,0) not null,
  delivery_method text not null check (delivery_method in ('delivery','pickup')),
  payment_method text not null check (payment_method in ('cash','transfer')),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed'))
);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
alter table public.catalog enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
revoke all on table public.catalog, public.inventory, public.orders from anon, authenticated;
revoke all on sequence public.offgrid_order_number from anon, authenticated;

create or replace function public.place_order(payload jsonb)
returns setof public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested jsonb;
  customer_data jsonb := payload->'customer';
  input_items jsonb := payload->'items';
  prod public.catalog%rowtype;
  stock_available integer;
  qty integer;
  requested_product_id text;
  variant_color text;
  variant_size text;
  calculated_subtotal numeric(12,0) := 0;
  shipping numeric(12,0);
  order_items jsonb := '[]'::jsonb;
  new_order public.orders%rowtype;
  request_uuid uuid;
  requested_count int;
begin
  if jsonb_typeof(input_items) <> 'array' or jsonb_array_length(input_items) not between 1 and 30
    or jsonb_typeof(customer_data) <> 'object'
    or length(trim(coalesce(customer_data->>'name',''))) not between 3 and 120
    or (customer_data->>'phone') !~ '^5959[0-9]{8}$'
    or (payload->>'deliveryMethod' = 'delivery' and length(trim(coalesce(customer_data->>'address',''))) not between 5 and 500)
    or length(coalesce(customer_data->>'address','')) > 500
    or length(coalesce(customer_data->>'notes','')) > 500
    or payload->>'deliveryMethod' not in ('delivery','pickup')
    or payload->>'paymentMethod' not in ('transfer','cash')
    or coalesce(payload->>'requestId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then raise exception 'Invalid order'; end if;

  request_uuid := (payload->>'requestId')::uuid;
  -- Las solicitudes repetidas con la misma UUID se serializan incluso si llegan simultáneamente.
  perform pg_advisory_xact_lock(hashtextextended(request_uuid::text, 0));
  select * into new_order from public.orders where request_key = request_uuid;
  if found then
    if new_order.request_fingerprint is distinct from md5(payload::text) then
      raise exception 'El pedido ya existe con datos distintos';
    end if;
    return next new_order;
    return;
  end if;

  -- Consolidar elementos iguales para evitar sobreventa mediante líneas repetidas.
  -- Orden fijo de bloqueos para evitar deadlocks entre compras simultáneas.
  for requested in
    select jsonb_build_object(
      'productId', item->>'productId',
      'color', item->>'color',
      'size', item->>'size',
      'quantity', sum((item->>'quantity')::integer)
    )
    from jsonb_array_elements(input_items) item
    where jsonb_typeof(item) = 'object'
    group by item->>'productId', item->>'color', item->>'size'
    order by item->>'productId', item->>'color', item->>'size'
  loop
    requested_product_id := requested->>'productId';
    variant_color := requested->>'color';
    variant_size := requested->>'size';
    qty := (requested->>'quantity')::integer;
    if qty < 1 or qty > 10 or requested_product_id is null or variant_color is null or variant_size is null
      or length(requested_product_id)>100 or length(variant_color)>100 or length(variant_size)>50
    then raise exception 'Invalid item'; end if;

    select * into prod from public.catalog where id = requested_product_id and active = true for share;
    if not found then raise exception 'Unavailable product'; end if;

    -- Bloqueo y descuento atómicos: una compra concurrente no puede reservar el mismo stock.
    select quantity into stock_available from public.inventory
      where inventory.product_id = requested_product_id
        and inventory.color = variant_color and inventory.size = variant_size for update;
    if not found or stock_available < qty then raise exception 'Insufficient stock'; end if;

    update public.inventory set quantity = quantity - qty
      where inventory.product_id = requested_product_id
        and inventory.color = variant_color and inventory.size = variant_size;

    calculated_subtotal := calculated_subtotal + prod.price * qty;
    order_items := order_items || jsonb_build_array(jsonb_build_object(
      'productId', requested_product_id, 'name', prod.data->>'name', 'price', prod.price,
      'color', variant_color, 'size', variant_size, 'quantity', qty,
      'image', prod.data->>'image'
    ));
  end loop;

  select count(*) into requested_count from jsonb_array_elements(input_items);
  if jsonb_array_length(order_items) = 0 or requested_count = 0 then raise exception 'Empty order'; end if;
  shipping := case when payload->>'deliveryMethod' = 'pickup' or calculated_subtotal >= 500000 then 0 else 15000 end;
  -- No confirmar una compra por un precio distinto al que el cliente aceptó.
  if coalesce((payload->>'expectedSubtotal')::numeric, -1) <> calculated_subtotal
    or coalesce((payload->>'expectedDeliveryCost')::numeric, -1) <> shipping then
    raise exception 'La cotización cambió. Actualizá el carrito.';
  end if;
  insert into public.orders (code, request_key, request_fingerprint, customer, items, subtotal, delivery_cost, total, delivery_method, payment_method)
  values ('OFF-' || lpad(nextval('public.offgrid_order_number')::text, 6, '0'), request_uuid, md5(payload::text),
    jsonb_build_object(
      'name',trim(customer_data->>'name'), 'phone',customer_data->>'phone',
      'address',trim(customer_data->>'address'), 'notes',coalesce(customer_data->>'notes','')
    ),
    order_items, calculated_subtotal, shipping, calculated_subtotal + shipping,
    payload->>'deliveryMethod', payload->>'paymentMethod')
  returning * into new_order;
  return next new_order;
end;
$$;
revoke all on function public.place_order(jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb) to service_role;

-- Inicialización atómica del catálogo: evita un estado intermedio sin inventario.
create or replace function public.bootstrap_catalog(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  catalog_count int;
  variant_count int;
begin
  perform pg_advisory_xact_lock(59172026);
  if exists (select 1 from public.catalog limit 1) then
    raise exception 'Catalog already initialized';
  end if;
  if jsonb_typeof(payload->'catalog') <> 'array'
    or jsonb_array_length(payload->'catalog') = 0
    or jsonb_typeof(payload->'inventory') <> 'array'
  then raise exception 'Invalid seed data'; end if;

  insert into public.catalog (id, data, price, active)
  select id, data, price, active
  from jsonb_to_recordset(payload->'catalog') as item(id text, data jsonb, price numeric, active boolean);
  get diagnostics catalog_count = row_count;

  insert into public.inventory (product_id, color, size, quantity)
  select product_id, color, size, quantity
  from jsonb_to_recordset(payload->'inventory') as item(product_id text, color text, size text, quantity integer);
  get diagnostics variant_count = row_count;

  return jsonb_build_object('products', catalog_count, 'variants', variant_count);
end;
$$;
revoke all on function public.bootstrap_catalog(jsonb) from public, anon, authenticated;
grant execute on function public.bootstrap_catalog(jsonb) to service_role;

-- Cancelar un pedido repone stock una sola vez. No se permite reabrir un pedido cancelado.
create or replace function public.set_order_status(order_uuid uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_order public.orders%rowtype;
  item jsonb;
  affected integer;
begin
  if new_status not in ('pending','confirmed','preparing','shipped','delivered','cancelled') then
    raise exception 'Invalid status';
  end if;
  select * into current_order from public.orders where id = order_uuid for update;
  if not found then raise exception 'Unknown order'; end if;
  if current_order.status = 'cancelled' and new_status <> 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened';
  end if;
  if current_order.status = 'delivered' and new_status <> 'delivered' then
    raise exception 'Delivered orders cannot be reverted';
  end if;
  if current_order.status = 'shipped' and new_status in ('pending','confirmed','preparing','cancelled') then
    raise exception 'Shipped orders cannot be reverted or cancelled';
  end if;
  if current_order.status <> 'cancelled' and new_status = 'cancelled' then
    for item in select value from jsonb_array_elements(current_order.items)
    loop
      update public.inventory set quantity = quantity + (item->>'quantity')::integer
        where product_id = item->>'productId'
        and color = item->>'color'
        and size = item->>'size';
      get diagnostics affected = row_count;
      if affected <> 1 then raise exception 'Inventory row missing'; end if;
    end loop;
  end if;
  update public.orders set status = new_status where id = order_uuid;
end;
$$;
revoke all on function public.set_order_status(uuid,text) from public, anon, authenticated;
grant execute on function public.set_order_status(uuid,text) to service_role;


-- Herramienta para presentaciones: sólo el servidor autorizado puede restaurar datos ficticios.
create or replace function public.reset_offgrid_demo()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  n_orders integer;
  n_variants integer := 0;
  n_inventory integer;
  fixture record;
begin
  perform pg_advisory_xact_lock(84921006);
  select count(*) into n_inventory from public.inventory;

  -- Verificar que cada combinación de color/talle del fixture exista
  -- y sea única antes de borrar pedidos de prueba.
  for fixture in
    select c.id as product_id,
           v.value->>'color' as variant_color,
           sizes.key as variant_size,
           greatest(0, sizes.value::integer) as initial_quantity
    from public.catalog c
    cross join lateral jsonb_array_elements(c.data->'variants') as v(value)
    cross join lateral jsonb_each_text(v.value->'stock') as sizes(key, value)
  loop
    if not exists (
      select 1 from public.inventory i
      where i.product_id=fixture.product_id
        and i.color=fixture.variant_color
        and i.size=fixture.variant_size
    ) then
      raise exception 'Falta variante de inventario del fixture DEMO';
    end if;
    n_variants := n_variants + 1;
  end loop;

  if n_variants <> n_inventory then
    raise exception 'Inventario DEMO y fixture no coinciden';
  end if;

  select count(*) into n_orders from public.orders;
  delete from public.orders;

  update public.catalog
    set price = greatest(0, (data->>'price')::numeric),
        active = true;

  -- Cambiar una fila por vez evita cardinalidad ambigua en el UPDATE.
  for fixture in
    select c.id as product_id,
           v.value->>'color' as variant_color,
           sizes.key as variant_size,
           greatest(0, sizes.value::integer) as initial_quantity
    from public.catalog c
    cross join lateral jsonb_array_elements(c.data->'variants') as v(value)
    cross join lateral jsonb_each_text(v.value->'stock') as sizes(key, value)
  loop
    update public.inventory
    set quantity=fixture.initial_quantity
    where product_id=fixture.product_id
      and color=fixture.variant_color
      and size=fixture.variant_size;
    if not found then
      raise exception 'Variante del fixture DEMO desapareció durante el restablecimiento';
    end if;
  end loop;
  return jsonb_build_object('orders_deleted',n_orders,'variants_reset',n_variants);
end;
$$;
revoke all on function public.reset_offgrid_demo() from public, anon, authenticated;
grant execute on function public.reset_offgrid_demo() to service_role;
