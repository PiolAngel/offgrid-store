# OFFGRID — puesta en marcha de pedidos reales

Este branch es una implementación pendiente de activación y pruebas de extremo a extremo. **No publicar en producción sin completar las comprobaciones**.

## Estado comprobado (22/11/2026)
- Supabase `offgrid-store` (`gjelyawmgjbomjhulcsj`): **ACTIVE_HEALTHY**, esquema creado, RLS habilitado y sin lectura pública de clientes.
- Datos: **12 productos, 88 variantes, 367 unidades**. Inventario inicial DEMO de 366; el administrador agregó 1 unidad de White Sneakers Blanco 38. **Este inventario aún NO fue validado físicamente**.
- Pedidos permanentes: **0** durante las pruebas; se ejecutaron pruebas transaccionales y se revirtieron.
- Migraciones instaladas en Supabase: `offgrid_real_orders_inventory_admin_v1`, `offgrid_fix_inventory_row_lock`, `offgrid_quote_guard_and_idempotency_lock`, `offgrid_pickup_optional_address`, `offgrid_request_payload_fingerprint`.
- Reglas verificadas mediante `supabase/tests/order-smoke.sql`: precio confirmado por el cliente, descuento/restitución de stock, idempotencia de pedidos y bloqueo de reutilización de UUID con carrito distinto.
- Variables `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`: confirmadas en Vercel tanto para producción como para Preview de la rama. **No se exponen valores privados en Git**.
- Vercel Preview: API `/api/catalog` devuelve productos y stock desde Supabase; login de `/admin` reconocido como configurado, el usuario accedió al panel y comprobó guardado de stock.
- Imágenes: 42 archivos de catálogo (principales y variantes) respondieron HTTP 200.
- **PENDIENTE indispensable antes de publicar:** inventario/precios REALES; confirmación de WhatsApp comercial y logística; prueba completa de compra real desde navegador/móvil; revisión de política de privacidad y protección del dominio.
- Trabajo en PR borrador de GitHub `#1`. **No fusionar a `main` ni vender con stock DEMO**.

## Qué cambia
- Catálogo y stock administrados en Supabase PostgreSQL.
- Checkout guarda pedidos en el servidor: precios, envío y descuento de stock se calculan de nuevo en una transacción SQL.
- Panel privado en `/admin` para pedidos, estados, precios, publicación y stock por variante.
- Carrito persistente entre recargas.
- WhatsApp coordina pago y entrega. **No existe pasarela de cobro online**.
- Un pedido registrado sigue apareciendo en el panel aunque el comprador cierre la web; enviar el mensaje por WhatsApp es una acción adicional del comprador.

## Activación segura
1. **Ya realizado en este proyecto.** No crear otro proyecto ni ejecutar de nuevo el SQL de instalación.
2. En Vercel → offgrid-store → Settings → Environment Variables, configurar directamente:
   - `SUPABASE_URL`: URL HTTPS del proyecto (**ya configurada**).
   - `SUPABASE_SECRET_KEY`: clave secreta moderna `sb_secret_...` (**ya configurada**). Nunca debe ser pública.
   - `ADMIN_PASSWORD`: contraseña larga y exclusiva para el panel (**ya configurada por el propietario**).
   - `ADMIN_SESSION_SECRET`: cadena aleatoria de al menos 32 caracteres (**ya configurada**).
   Ya existe en Preview y Production; si cambia alguna variable, regenerar el despliegue que la usa.
3. **Ya inicializado.** Abrir el despliegue Preview y entrar en `/admin`, sin volver a pulsar inicializar.
4. Probar desde dos navegadores distintos: inventario, precios, alta de pedido, registro en el panel, descuento de stock, pedido con producto agotado, cambios de estado y WhatsApp.
5. Confirmar que el número de WhatsApp configurado en `src/lib/whatsapp.ts` es el del negocio, y confirmar medios de pago, costo de delivery y punto de retiro.
6. Revisar desktop y móvil. El PR #1 ya existe; fusionarlo con `main` solo cuando se pruebe todo.

## Limitaciones y decisiones comerciales
- El stock se descuenta al registrar el pedido, aunque el comprador todavía no haya enviado WhatsApp. Los pedidos pendientes deben ser atendidos y, si no se concretan, cancelados desde el panel: esa cancelación repone automáticamente el stock. No hay expiración automática de pedidos.
- El panel muestra como máximo los últimos 200 pedidos en esta primera BETA.
- Se necesita política de privacidad/tratamiento de datos del cliente, revisión de condiciones de envío y respaldo de base de datos antes de operar públicamente.
- El acceso administrativo usa contraseña única. Activar una contraseña robusta, rotarla cuando corresponda y considerar protección adicional antes de escalar.
- No distribuir la clave `SUPABASE_SECRET_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` ni añadirla a Git.
