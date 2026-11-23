-- Exact replacement applied in Supabase migration offgrid_reset_where_clause_fix (version 20261123232803).
-- Fix confirmed by PostgreSQL logs: SQLSTATE 21000, DELETE requires a WHERE clause.
-- Creating/replacing this function does NOT perform a reset or delete data.
-- Aplicar SOLO con autorización de Dirección General, en una ventana
-- controlada de actualización de la DEMO. No ejecuta el restablecimiento:
-- únicamente reemplaza su definición.
-- Revisión por código 21000 en PostgREST: evitamos UPDATE ... FROM con
-- expansión de variantes, y actualizamos cada clave de inventario una vez.
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
  delete from public.orders where id is not null;

  update public.catalog
    set price = greatest(0, (data->>'price')::numeric),
        active = true
    where id is not null;

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
