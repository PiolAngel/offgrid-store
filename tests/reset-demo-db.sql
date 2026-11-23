-- Se ejecuta EXCLUSIVAMENTE en PostgreSQL aislado de GitHub Actions.
\set ON_ERROR_STOP on
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;

create table public.catalog (
  id text primary key, data jsonb not null,
  price numeric(12,0) not null, active boolean not null default true
);
create table public.inventory (
  product_id text not null references public.catalog(id),
  color text not null, size text not null,
  quantity integer not null check(quantity>=0),
  primary key(product_id,color,size)
);
create table public.orders (id integer generated always as identity primary key);

\i supabase/migrations/20261123235700_fix_offgrid_demo_reset.sql

insert into public.catalog(id,data,price,active) values (
  '5',
  '{"name":"Essential Tee","price":189000,"variants":[{"color":"Crema","stock":{"S":4,"M":2}},{"color":"Gris","stock":{"S":1,"M":5}},{"color":"Negro","stock":{"S":2}}]}'::jsonb,
  999999,false
);
insert into public.inventory(product_id,color,size,quantity) values
  ('5','Crema','S',11),('5','Crema','M',13),
  ('5','Gris','S',8),('5','Gris','M',3),('5','Negro','S',0);
insert into public.orders default values;

select public.reset_offgrid_demo() as result;

do $test$
begin
  if (select count(*) from public.orders) <> 0 then
    raise exception 'Pedidos ficticios no borrados';
  end if;
  if (select count(*) from public.catalog where id='5' and price=189000 and active=true) <> 1 then
    raise exception 'Precio/actividad no restaurados';
  end if;
  if (select count(*) from public.inventory i
      join public.catalog c on c.id=i.product_id
      cross join lateral jsonb_array_elements(c.data->'variants') v(item)
      cross join lateral jsonb_each_text(v.item->'stock') s(size, initial_quantity)
      where i.color=v.item->>'color' and i.size=s.size and i.quantity=s.initial_quantity::integer) <> 5 then
    raise exception 'Inventario no restaurado para todas las variantes';
  end if;
  if has_function_privilege('anon','public.reset_offgrid_demo()','execute')
     or has_function_privilege('authenticated','public.reset_offgrid_demo()','execute') then
    raise exception 'Función privada expuesta';
  end if;
  if not has_function_privilege('service_role','public.reset_offgrid_demo()','execute') then
    raise exception 'Servidor sin permiso de reset';
  end if;
end;
$test$;

-- Verificar error atómico: un fixture sin fila de inventario debe impedir
-- el borrado de pedidos, sin tocar datos persistentes.
insert into public.catalog(id,data,price,active)
  values('6','{"price":1000,"variants":[{"color":"Azul","stock":{"L":3}}]}'::jsonb,1000,true);
insert into public.orders default values;
do $test$
begin
  begin
    perform public.reset_offgrid_demo();
    raise exception 'Se aceptó un fixture incompleto';
  exception when others then
    if SQLERRM='Se aceptó un fixture incompleto' then raise; end if;
  end;
  if (select count(*) from public.orders) <> 1 then
    raise exception 'Reset fallido eliminó pedidos de prueba';
  end if;
end;
$test$;
select 'RESET_DEMO_ISOLATED_PASS' as result;
