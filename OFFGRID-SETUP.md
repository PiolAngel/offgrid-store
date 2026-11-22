# OFFGRID — puesta en marcha de pedidos reales

Este branch es una implementación pendiente de activación y pruebas de extremo a extremo. **No publicar en producción sin completar las comprobaciones**.

## Estado comprobado (22/11/2026)
- Proyecto Supabase existente: `offgrid-store` (`gjelyawmgjbomjhulcsj`) restaurado y **ACTIVE_HEALTHY**.
- Migraciones SQL aplicadas: `offgrid_real_orders_inventory_admin_v1`, `offgrid_fix_inventory_row_lock`.
- Inicialización realizada: **12 productos, 88 variantes, 366 unidades DEMO**. **NO repetir `supabase/schema.sql` ni volver a inicializar**.
- Pruebas de SQL completadas dentro de transacciones deshechas: pedido, descuento, idempotencia, cancelación, entrega, falta de stock y restricciones de acceso. Pedidos reales almacenados: **0**.
- Variables `SUPABASE_URL` y `ADMIN_SESSION_SECRET` cargadas en Vercel (Preview de rama y Production).
- PENDIENTE usuario en Vercel: `SUPABASE_SECRET_KEY` y `ADMIN_PASSWORD`, **sin compartir los valores por chat**.
- PENDIENTE: pruebas completas desde la web, verificar inventario REAL y teléfono/condiciones de envío; NO publicar hasta entonces.

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
   - `SUPABASE_SECRET_KEY`: clave secreta moderna `sb_secret_...` de servidor (nunca NEXT_PUBLIC). También se admite la antigua `SUPABASE_SERVICE_ROLE_KEY`, pero se prefiere la moderna.
   - `ADMIN_PASSWORD`: contraseña larga y exclusiva para el panel.
   - `ADMIN_SESSION_SECRET`: cadena aleatoria de al menos 32 caracteres (**ya configurada**).
   Configurar Preview primero. Cuando se compruebe todo, configurar Production.
3. **Ya inicializado.** Abrir el despliegue Preview y entrar en `/admin`, sin volver a pulsar inicializar.
4. Probar desde dos navegadores distintos: inventario, precios, alta de pedido, registro en el panel, descuento de stock, pedido con producto agotado, cambios de estado y WhatsApp.
5. Confirmar que el número de WhatsApp configurado en `src/lib/whatsapp.ts` es el del negocio, y confirmar medios de pago, costo de delivery y punto de retiro.
6. Revisar desktop y móvil. Solo después abrir PR/merge a `main` para producción.

## Limitaciones y decisiones comerciales
- El stock se descuenta al registrar el pedido, aunque el comprador todavía no haya enviado WhatsApp. Pedidos abandonados o cancelados requieren revisión y reposición manual mediante el panel. Esto debe probarse.
- El panel muestra como máximo los últimos 200 pedidos en esta primera BETA.
- Se necesita política de privacidad/tratamiento de datos del cliente, revisión de condiciones de envío y respaldo de base de datos antes de operar públicamente.
- El acceso administrativo usa contraseña única. Activar una contraseña robusta, rotarla cuando corresponda y considerar protección adicional antes de escalar.
- No distribuir la clave `SUPABASE_SECRET_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` ni añadirla a Git.
