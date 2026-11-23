# OFFGRID — BETA comercial

Demostración profesional de una tienda de streetwear para el catálogo comercial de una agencia web en Paraguay.

**OFFGRID no vende mercadería real.** Los productos, precios, inventario y pedidos son ficticios. No se cobran pagos ni se gestionan entregas reales.

## Stack

Next.js 16, React 19, Tailwind CSS 4, Vercel y Supabase PostgreSQL.

## Funcionalidades

- Catálogo responsive con categorías, destacados, filtros, galerías y variantes por color/talle.
- Carrito persistente y sincronizado con stock y precios de Supabase.
- Checkout de **demostración** de cuatro etapas, con datos ficticios predefinidos, validaciones y confirmación.
- Pedidos ficticios guardados en Supabase, descuento de stock transaccional, control de precio e idempotencia.
- Panel privado en `/admin`: pedidos, estados, precios, productos y existencias.
- **Restablecer demo** en el panel: limpia pedidos ficticios, restaura precios y stock originales y permite repetir las presentaciones.
- Aviso visible de demostración y `noindex` para evitar confundir la BETA con un negocio real.
- WhatsApp abre un borrador de mensaje sin un destinatario real; solo se habilita chat directo al configurar `NEXT_PUBLIC_OFFGRID_WHATSAPP`.

## Desarrollo

```bash
npm ci
npm run dev
npm run lint
npm run build
```

### Variables de entorno

| Variable | Exposición | Uso |
|---|---|---|
| `SUPABASE_URL` | Solo servidor | URL del proyecto de prueba |
| `SUPABASE_SECRET_KEY` | Solo servidor | Clave secreta de Supabase |
| `ADMIN_PASSWORD` | Solo servidor | Contraseña de administración |
| `ADMIN_SESSION_SECRET` | Solo servidor | Firma de sesión de al menos 32 caracteres |
| `NEXT_PUBLIC_OFFGRID_WHATSAPP` | Opcional / cliente | Teléfono comercial solo para un eventual uso real |

No subir secretos a Git ni ponerlos en variables `NEXT_PUBLIC_`.

## Verificaciones

- `npm run build`: ejecuta ESLint y la compilación TypeScript/Next.js.
- `.github/workflows/offgrid-quality.yml`: calidad automática de cada PR.
- `.github/workflows/offgrid-e2e.yml`: Chromium y pruebas de compra en desktop/móvil, carrito, confirmación y panel administrativo.
- `tests/e2e-demo.mjs`: simula respuestas de API para probar la interfaz sin alterar Supabase.
- `supabase/tests/order-smoke.sql`: prueba las transacciones reales de Supabase con `ROLLBACK`, sin guardar pedidos.
- `supabase/schema.sql`: estructura de una instalación nueva (no ejecutar otra vez en el proyecto existente).
- `OFFGRID-SETUP.md`: entorno, estado de despliegue, procedimientos y límites de la demo.

## Uso comercial

Se comparte el enlace público de la demo. Para presentar el flujo completo se puede usar **«Usar datos de ejemplo»** en el checkout y **«Restablecer demo»** desde el panel entre presentaciones.

No es necesario verificar inventario físico. Nunca presentar pedidos ni pagos simulados como operaciones comerciales reales.
