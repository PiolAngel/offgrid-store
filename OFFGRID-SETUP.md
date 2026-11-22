# OFFGRID — puesta en marcha de pedidos reales

Este branch es una implementación pendiente de activación y pruebas de extremo a extremo. **No publicar en producción sin completar las comprobaciones**.

## Qué cambia
- Catálogo y stock administrados en Supabase PostgreSQL.
- Checkout guarda pedidos en el servidor: precios, envío y descuento de stock se calculan de nuevo en una transacción SQL.
- Panel privado en `/admin` para pedidos, estados, precios, publicación y stock por variante.
- Carrito persistente entre recargas.
- WhatsApp coordina pago y entrega. **No existe pasarela de cobro online**.
- Un pedido registrado sigue apareciendo en el panel aunque el comprador cierre la web; enviar el mensaje por WhatsApp es una acción adicional del comprador.

## Activación segura
1. Crear proyecto Supabase en la cuenta del propietario y ejecutar `supabase/schema.sql` en SQL Editor. No compartir claves en chats.
2. En Vercel → offgrid-store → Settings → Environment Variables, configurar directamente:
   - `SUPABASE_URL`: URL HTTPS del proyecto.
   - `SUPABASE_SECRET_KEY`: clave secreta moderna `sb_secret_...` de servidor (nunca NEXT_PUBLIC). También se admite la antigua `SUPABASE_SERVICE_ROLE_KEY`, pero se prefiere la moderna.
   - `ADMIN_PASSWORD`: contraseña larga y exclusiva para el panel.
   - `ADMIN_SESSION_SECRET`: cadena aleatoria de al menos 32 caracteres.
   Configurar Preview primero. Cuando se compruebe todo, configurar Production.
3. Abrir el despliegue Preview del branch y entrar en `/admin`. Inicializar el catálogo desde el panel **una sola vez**. Esto copia los productos y stock de `src/data/products.ts`.
4. Probar desde dos navegadores distintos: inventario, precios, alta de pedido, registro en el panel, descuento de stock, pedido con producto agotado, cambios de estado y WhatsApp.
5. Confirmar que el número de WhatsApp configurado en `src/lib/whatsapp.ts` es el del negocio, y confirmar medios de pago, costo de delivery y punto de retiro.
6. Revisar desktop y móvil. Solo después abrir PR/merge a `main` para producción.

## Limitaciones y decisiones comerciales
- El stock se descuenta al registrar el pedido, aunque el comprador todavía no haya enviado WhatsApp. Pedidos abandonados o cancelados requieren revisión y reposición manual mediante el panel. Esto debe probarse.
- El panel muestra como máximo los últimos 200 pedidos en esta primera BETA.
- Se necesita política de privacidad/tratamiento de datos del cliente, revisión de condiciones de envío y respaldo de base de datos antes de operar públicamente.
- El acceso administrativo usa contraseña única. Activar una contraseña robusta, rotarla cuando corresponda y considerar protección adicional antes de escalar.
- No distribuir la clave `SUPABASE_SECRET_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` ni añadirla a Git.
