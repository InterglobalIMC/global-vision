# Global Vision — Historial de Fases

## Estado actual: **Fase 5 — Pulido** (en progreso)

### Nota técnica
- Se usa `@opennextjs/cloudflare` en vez de `@cloudflare/next-on-pages` porque este último no soporta Next.js 16
- Se usa `wrangler.jsonc` en vez de `wrangler.toml`

### Para deploy — 2 comandos
```bash
npx wrangler login          # autenticar con Cloudflare
./setup.sh                  # crear D1, R2 y deploy en una sola ejecución
```

### Archivos creados
- `setup.sh` — script de setup + deploy
- `README.md` — documentación del proyecto
- `schema.sql` — schema de la tabla products
- `lib/db.ts` — helpers para D1
- `lib/r2.ts` — helpers para R2
- `lib/config.ts` — variables de entorno
- `app/api/products/route.ts` — GET (listar) + POST (crear)
- `app/api/products/[id]/route.ts` — GET, PUT, DELETE
- `app/api/upload/route.ts` — subir imagen a R2
- `app/page.tsx` — catálogo público con grilla responsive
- `app/layout.tsx` — root layout con fuentes y metadata
- `app/globals.css` — estilos globales + sistema visual
- `components/ProductCard.tsx` — tarjeta de producto con efecto blur → focus
- `components/WhatsAppButton.tsx` — botón de WhatsApp dinámico
- `components/ProductForm.tsx` — formulario compartido de creación/edición
- `app/admin/page.tsx` — lista de productos (admin)
- `app/admin/products/new/page.tsx` — formulario de creación
- `app/admin/products/[id]/page.tsx` — formulario de edición
- `wrangler.jsonc` — configuración Cloudflare
- `open-next.config.ts` — configuración OpenNext
- `next.config.ts` — configuración Next.js con OpenNext
- `cloudflare-env.d.ts` — tipos generados para entorno Cloudflare

---

## Fase 1 — Fundacional
**Estado:** Completada

- [x] Inicializar proyecto Next.js (App Router + TypeScript + Tailwind)
- [x] Configurar `@opennextjs/cloudflare` + `wrangler`
- [x] Configurar `next.config.ts` con `initOpenNextCloudflareForDev()`
- [x] Crear schema D1 (`schema.sql`)
- [x] Configurar `wrangler.jsonc` (bindings D1, R2, WHATSAPP_NUMBER)
- [x] Crear lib helpers (`db.ts`, `r2.ts`, `config.ts`)
- [x] Crear API routes (`/api/products`, `/api/products/[id]`, `/api/upload`)
- [x] Configurar sistema visual (colores, fuentes en Tailwind)
- [x] Build exitoso con OpenNext + TypeScript
- [x] Deploy inicial en Cloudflare Workers
- [x] URL: https://global-vision.interglobal-imc.workers.dev

---

## Fase 2 — Catálogo público
**Estado:** Completada

- [x] `lib/db.ts` — acceso a D1 (ya creado)
- [x] `lib/config.ts` — nombre del negocio, WhatsApp, etc. (ya creado)
- [x] `lib/r2.ts` — subida/lectura de imágenes R2 (ya creado)
- [x] `GET /api/products` — listar productos disponibles (ya creado)
- [x] `GET /api/products/[id]` — detalle de producto (ya creado)
- [x] Sistema visual: colores y fuentes en `globals.css` (ya configurado)
- [x] `ProductCard.tsx` — tarjeta con efecto blur → focus
- [x] `app/page.tsx` — grilla responsive (1/2/3 cols) + empty state
- [x] `WhatsAppButton.tsx` — botón de WhatsApp dinámico
- [x] Deploy en producción

---

## Fase 3 — WhatsApp
**Estado:** Completada (integrada en Fase 2)

- [x] `WhatsAppButton.tsx` — link wa.me dinámico (ya creado)
- [x] Integración en `ProductCard.tsx` (ya creado)
- [x] Botón WhatsApp fallback en empty state (ya creado)

---

## Fase 4 — Panel admin
**Estado:** Completada

- [x] `POST /api/products` — crear producto
- [x] `PUT /api/products/[id]` — editar producto
- [x] `DELETE /api/products/[id]` — eliminar producto
- [x] `POST /api/upload` — subir imagen a R2 (ya creado)
- [x] `ProductForm.tsx` — formulario compartido con drag & drop
- [x] `app/admin/page.tsx` — lista de productos con acciones
- [x] `app/admin/products/new/page.tsx` — formulario creación
- [x] `app/admin/products/[id]/page.tsx` — formulario edición
- [ ] `middleware.ts` — protección con Cloudflare Access (pendiente para producción)

---

## Fase 5 — Pulido
**Estado:** En progreso

- [ ] Manejo de errores y validación de inputs
- [x] SEO: meta tags, Open Graph para Global Vision (ya configurado en layout.tsx)
- [ ] Optimización de imágenes (compresión, lazy loading)
- [ ] Tests en dispositivos reales

---

## Fase 6 — Producción
**Estado:** Pendiente

- [ ] Dominio propio conectado
- [ ] Cloudflare Access configurado
- [ ] Variable WHATSAPP_NUMBER con número real
- [ ] Deploy final
- [x] README.md con instrucciones de uso (setup.sh creado)
