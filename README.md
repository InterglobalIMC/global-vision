# Global Vision — Catálogo de Gafas

Sitio web con catálogo de gafas para Global Vision. El cliente elige una montura y contacta al dueño por WhatsApp.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Cloudflare Workers (via @opennextjs/cloudflare)
- **Base de datos:** Cloudflare D1
- **Almacenamiento:** Cloudflare R2
- **Auth:** Cloudflare Access (Zero Trust)

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy a Cloudflare

### 1. Autenticar
```bash
npx wrangler login
```

### 2. Setup automático (D1 + R2 + deploy)
```bash
./setup.sh
```

Este script crea:
- Base de datos D1 `global-vision-db`
- Bucket R2 `global-vision-images`
- Ejecuta el schema SQL
- Despliega a Cloudflare Workers

### 3. Deploy manual (si ya tenés los recursos)
```bash
npm run deploy
```

## Variables de entorno

Configuradas en `wrangler.jsonc`:

| Variable | Descripción |
|---|---|
| `WHATSAPP_NUMBER` | Número de WhatsApp del negocio (formato: `57XXXXXXXXXX`) |
| `BUSINESS_NAME` | Nombre del negocio |

Para actualizar, editá `wrangler.jsonc` y ejecutá `npm run deploy`.

## Estructura del proyecto

```
global-vision/
├── app/
│   ├── page.tsx              # Catálogo público
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── globals.css           # Estilos globales + sistema visual
│   └── api/
│       ├── products/route.ts # GET (listar) + POST (crear)
│       ├── products/[id]/route.ts # GET, PUT, DELETE
│       └── upload/route.ts   # Subir imagen a R2
├── lib/
│   ├── db.ts                 # Helpers D1
│   ├── r2.ts                 # Helpers R2
│   └── config.ts             # Variables de entorno
├── schema.sql                # Schema de la tabla products
├── wrangler.jsonc            # Configuración Cloudflare
├── open-next.config.ts       # Configuración OpenNext
└── setup.sh                  # Script de setup + deploy
```

## API Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/products` | No | Listar productos disponibles |
| `GET` | `/api/products/[id]` | No | Detalle de producto |
| `POST` | `/api/products` | Sí | Crear producto |
| `PUT` | `/api/products/[id]` | Sí | Editar producto |
| `DELETE` | `/api/products/[id]` | Sí | Eliminar producto |
| `POST` | `/api/upload` | Sí | Subir imagen a R2 |
