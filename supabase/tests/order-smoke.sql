-- Prueba regresiva de pedidos OFFGRID. No conserva pedidos ni altera existencias.
-- Ejecutar en SQL Editor de Supabase o con una conexión SQL autorizada.
begin;
do $test$
declare
  product text; color_name text; size_name text; initial_stock int; unit_price numeric;
  shipping numeric;
  row_order public.orders%rowtype; retry public.orders%rowtype;
  order_payload jsonb; stock_after int;
begin
  select c.id, i.color, i.size, i.quantity, c.price
  into product, color_name, size_name, initial_stock, unit_price
  from public.catalog c join public.inventory i on i.product_id=c.id
  where c.active and i.quantity>0 and c.price>0
  order by c.id, i.color, i.size limit 1;
  if product is null then raise exception 'Sin productos para probar'; end if;
  shipping:=case when unit_price>=500000 then 0 else 15000 end;
  order_payload:=jsonb_build_object(
    'requestId',gen_random_uuid()::text,
    'customer',jsonb_build_object('name','Cliente De Prueba','phone','595981000000','address','Dirección de prueba 123'),
    'items',jsonb_build_array(jsonb_build_object('productId',product,'color',color_name,'size',size_name,'quantity',1)),
    'deliveryMethod','delivery','paymentMethod','cash',
    'expectedSubtotal',unit_price,'expectedDeliveryCost',shipping
  );
  begin
    perform public.place_order(jsonb_set(order_payload,'{expectedSubtotal}','-1'::jsonb));
    raise exception 'Error: aceptó precio inválido';
  exception when raise_exception then
    if sqlerrm='Error: aceptó precio inválido' then raise; end if;
  end;
  select * into row_order from public.place_order(order_payload);
  if row_order.id is null or row_order.total<>unit_price+shipping then
    raise exception 'Error: pedido o total inválido';
  end if;
  select quantity into stock_after from public.inventory where product_id=product and color=color_name and size=size_name;
  if stock_after<>initial_stock-1 then raise exception 'Error: stock no descontado'; end if;
  select * into retry from public.place_order(order_payload);
  if retry.id<>row_order.id then raise exception 'Error: pedido duplicado'; end if;
  perform public.set_order_status(row_order.id,'cancelled');
  select quantity into stock_after from public.inventory where product_id=product and color=color_name and size=size_name;
  if stock_after<>initial_stock then raise exception 'Error: cancelación no repuso stock'; end if;
  begin
    perform public.set_order_status(row_order.id,'confirmed');
    raise exception 'Error: pedido cancelado reabierto';
  exception when raise_exception then
    if sqlerrm='Error: pedido cancelado reabierto' then raise; end if;
  end;
  raise notice 'Prueba OFFGRID aprobada; rollback pendiente.';
end
$test$;
rollback;
