# OFFGRID | BETA comercial — estado y operación

## Alcance confirmado por Dirección General
OFFGRID es una **web de demostración de la agencia**, no una tienda que acepta ventas reales. Los 12 productos, variantes, 367 unidades actuales de inventario y precios son ficticios. No se debe pedir inventario físico, pasarela de pago ni número comercial real para concluir esta BETA.

## Infraestructura

- GitHub: `PiolAngel/offgrid-store`, rama de trabajo `feat/offgrid-real-orders-beta`, PR #1.
- Vercel: proyecto `offgrid-store`. El dominio principal previsto para la demo es `https://offgrid-store-rho.vercel.app`.
- Supabase: proyecto existente `offgrid-store` (`gjelyawmgjbomjhulcsj`).
- Variables `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` ya configuradas en Vercel para Preview y Production, sin exponer valores en Git.

## Comportamiento funcional

- El catálogo consulta Supabase; si la consulta falla, el checkout se bloquea para no operar con inventario desactualizado.
- El panel administra pedidos ficticios, precios, activación de productos y stock por talle/color.
- El checkout registra pedidos ficticios mediante API; el servidor valida precios, evita sobreventa y reintentos duplicados.
- Cancelar un pedido repone stock. El botón **Restablecer demo** elimina pedidos ficticios y recupera los valores de catálogo de origen.
- La interfaz anuncia que se trata de una demostración, ofrece datos de ejemplo y evita enviar mensajes directamente a un WhatsApp no confirmado.
- El sitio incluye metadatos `noindex` para evitar confundirlo con una tienda operativa.

## Base de datos

- Tablas: `catalog`, `inventory`, `orders`, con RLS.
- Funciones privadas: `place_order`, `set_order_status`, `bootstrap_catalog`, `reset_offgrid_demo`.
- La función de reset fue ejecutada dentro de una transacción revertida, confirmando que recupera stock, precio y actividad sin alterar los datos existentes.
- **No volver a ejecutar `supabase/schema.sql` ni inicializar el catálogo en el proyecto existente**.

## Control de calidad

- GitHub Actions ejecuta `npm run lint`, `npm run build` y Playwright en Chromium.
- Test de navegador en `tests/e2e-demo.mjs`: producto → carrito → checkout → confirmación para escritorio y celular; administración, guardar stock y reset con API simulada.
- Regresión SQL en `supabase/tests/order-smoke.sql`: cálculo de precios, stock, idempotencia y cancelación; los cambios se revierten.
- Se comprobaron 42 imágenes de productos y sus variantes, además de assets de portada e iconos.
- Los resultados de las verificaciones se registran en los workflows de la PR. Una compilación exitosa no reemplaza la verificación funcional.

## Procedimiento para una presentación

1. Compartir la página pública de OFFGRID.
2. Elegir un producto, color, talle y añadir al carrito.
3. En checkout usar **«Usar datos de ejemplo»**, completar entrega/pago ficticios y generar un pedido de demostración.
4. Abrir `/admin` con las credenciales privadas para visualizar el pedido y los cambios de stock.
5. Pulsar **«Restablecer demo»** y escribir `RESTABLECER DEMO` para limpiar datos de prueba tras la presentación.

## Seguridad y limitaciones explícitas

No hay cobros ni entregas reales. No introducir ni conservar datos privados de clientes reales en esta demo. No compartir credenciales administrativas. Los tests de navegador interceptan las APIs para no escribir datos reales; las transacciones de Supabase se verifican por separado.

La PR puede integrarse a `main` cuando GitHub Actions y Vercel estén verdes y la página pública muestre la BETA. En Preview puede mantenerse la protección de Vercel; producción debe poder abrirse sin inicio de sesión para funcionar como demo comercial.
