# OFFGRID — tienda streetwear (BETA)

Tienda en **Next.js 16**, React 19 y Tailwind 4, desplegada en Vercel. Backend de pedidos e inventario en Supabase PostgreSQL, con checkout que registra pedidos en el servidor y continuación por WhatsApp. No procesa pagos online.

## Rutas

- `/`: catálogo, filtros, productos y carrito persistente.
- `/checkout`: datos, modalidad de entrega, pago y confirmación de pedido.
- `/admin`: panel privado de pedidos, estados, precios, publicación y stock por variante.
- `/api/catalog`: consulta productos y stock centralizados. Si Supabase falla, se pausan compras para evitar vender cantidades ficticias.
- `/api/orders`: crea pedidos y descuenta stock transaccionalmente, con comprobación de precios y prevención de duplicados.

## Desarrollo

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Las variables de entorno se configuran en Vercel (o en `.env.local` para desarrollo; **nunca subir archivos .env a Git**):

| Variable | Alcance | Uso |
|---|---|---|
| `SUPABASE_URL` | Solo servidor | Dirección HTTPS del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Solo servidor | Clave secreta `sb_secret_...` para consultar y modificar datos |
| `ADMIN_PASSWORD` | Solo servidor | Contraseña larga y exclusiva del administrador |
| `ADMIN_SESSION_SECRET` | Solo servidor | Firma HMAC de sesiones, al menos 32 caracteres |
| `NEXT_PUBLIC_OFFGRID_WHATSAPP` | Público / opcional | Número comercial paraguayo sin signos, p. ej. `5959XXXXXXXX`; verificar antes de publicar |

No exponer claves de servicio en variables `NEXT_PUBLIC_`, código cliente, repositorio ni chats.

## Datos

El esquema de una instalación nueva está en `supabase/schema.sql`. Las migraciones aplicadas al proyecto BETA original se describen en `OFFGRID-SETUP.md`.

**Atención:** El proyecto Supabase de OFFGRID ya fue inicializado con datos de **demostración**. No repetir la inicialización; actualizar las cantidades mediante `/admin` después de hacer inventario físico. El sistema **descuenta** unidades al registrar el pedido y las **repone** al cancelarlo desde administración.

## Antes de aceptar pedidos reales

1. Confirmar teléfono de WhatsApp, costos y zonas de envío, lugar de retiro, formas de pago y políticas de atención.
2. Sustituir los valores DEMO de inventario y precios por existencias verdaderas, y ocultar productos no disponibles.
3. Verificar checkout real desde dos navegadores, cambios de stock y precios en admin y navegación móvil.
4. Comprobar despliegue de producción y acceso público, sin confundirlo con un enlace temporal de Preview.
5. Establecer una política de privacidad y un proceso operativo de atención, cancelación y respaldo de pedidos.

**No fusionar a `main` ni prometer entregas reales antes de completar estas verificaciones.**

El desarrollo y su estado de validación se mantienen en la PR de GitHub y la guía `OFFGRID-SETUP.md`.
