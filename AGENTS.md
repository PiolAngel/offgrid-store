<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Política AGENCIA WEB | Desarrollo y publicación

Estas reglas complementan las instrucciones de Next.js anteriores.

- Desarrollar en ramas `feat/*`, `fix/*`, `audit/*` o `ci/*`; nunca usar `main` como entorno de prueba.
- Agrupar cambios y evitar pushes de prueba repetitivos.
- Abrir un pull request hacia `main`; ejecutar GitHub Actions (calidad y pruebas de navegador) y corregir cualquier fallo.
- No integrar cambios sin pruebas verificadas y sin autorización de publicación de Dirección General.
- No hacer despliegues manuales, ni reintentar cuando Vercel indique cuota agotada.
- No modificar dominio, producción, permisos, credenciales ni datos de clientes sin autorización.
- Las BETA deben usar exclusivamente datos y contactos ficticios.
- Reportar qué se hizo, qué se comprobó realmente, enlaces a las pruebas, pendientes y versión pública.

**Importante:** esto es una política para agentes; no es una protección técnica de `main`. La protección de ramas o los Deployment Checks de Vercel deben habilitarse aparte cuando el plan y los permisos lo permitan.
