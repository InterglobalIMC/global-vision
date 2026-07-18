# Especificación técnica — Sitio web Óptica Restrepo

## 1. Resumen del proyecto

Sitio web con catálogo de gafas para venta sin pasarela de pagos. El cliente elige una montura y se le da la opción de contactar directamente por WhatsApp al dueño del negocio, quien cierra el negocio por su cuenta (pago, entrega, etc.). Incluye un panel de administración protegido donde el dueño puede gestionar el catálogo (agregar, editar, eliminar productos, subir fotos, cambiar precios) sin tocar código ni herramientas externas (Excel, Sheets, etc.).

---

## 2. Stack tecnológico

| Capa | Tecnología | Función |
|---|---|---|
| Hosting + Frontend | **Cloudflare Pages** | Sirve la app Next.js (catálogo público y panel admin) |
| Framework | **Next.js (App Router)** | Componentes React para catálogo y panel admin, Route Handlers para la API |
| Adaptador de despliegue | **`@cloudflare/next-on-pages`** | Convierte el build de Next.js en Pages Functions compatibles con Cloudflare |
| Backend / API | **Next.js Route Handlers en Edge Runtime** (`app/api/**/route.ts`) | Endpoints REST para CRUD de productos, corren como Pages Functions |
| Base de datos | **Cloudflare D1** (SQLite serverless) | Almacena catálogo de productos |
| Almacenamiento de archivos | **Cloudflare R2** | Guarda las fotos de las gafas |
| Autenticación admin | **Cloudflare Access (Zero Trust)** | Protege `/admin/*` con login por correo + OTP, sin contraseñas |
| Imágenes | Servidas directo desde la URL pública de R2, **sin `next/image` con optimización automática** | Evita el costo de Cloudflare Images; la compresión se hace al subir desde el panel admin |
| Estilos | **CSS Modules o Tailwind CSS** (a definir contigo) | Aplicar el sistema de diseño ya aprobado |
| Dominio + DNS + CDN | **Cloudflare Registrar / Cloudflare DNS** | Dominio propio con SSL automático |
| Control de versiones | **GitHub** | Repo conectado a Cloudflare Pages (deploy automático en cada push) |

**Por qué este stack:** todo sigue viviendo dentro del ecosistema gratuito de Cloudflare (Pages + Functions + D1 + R2 + Access), sin servidores que mantener y con deploy continuo desde GitHub. Se elige Next.js sobre vanilla JS porque es el stack de trabajo diario del desarrollador — mayor velocidad de desarrollo y mantenibilidad a largo plazo, con componentes reutilizables entre el catálogo y el panel admin. El único ajuste frente a un despliegue "estándar" de Next.js es que las funciones de API deben declararse con `export const runtime = 'edge'` para ser compatibles con el adaptador de Cloudflare, y que `next/image` no se usa con su optimizador por defecto.

---

## 3. Arquitectura

```
Public user                        Owner (admin)
      │                                   │
      ▼                                   ▼
yourdomain.com                   yourdomain.com/admin
(Cloudflare Pages)              (protected by Cloudflare Access)
      │                                   │
      ▼                                   ▼
   GET /api/products             POST/PUT/DELETE /api/products
      │                                   │
      └──────────────► Cloudflare Pages Functions ◄──────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       Cloudflare D1                    Cloudflare R2
      (data: name, price,               (files: eyewear
       description, stock,               photos)
       image_url)
```

---

## 4. Modelo de datos (Cloudflare D1)

Tabla `products`:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | |
| `name` | TEXT NOT NULL | Nombre del modelo/montura |
| `price` | INTEGER NOT NULL | En pesos colombianos, sin decimales |
| `description` | TEXT | Opcional |
| `image_url` | TEXT | URL pública del objeto en R2 |
| `available` | BOOLEAN DEFAULT 1 | Permite ocultar sin borrar |
| `sort_order` | INTEGER DEFAULT 0 | Orden de aparición en el catálogo |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | Se actualiza en cada edición |

---

## 5. Endpoints de la API (Next.js Route Handlers, Edge Runtime)

| Método | Ruta (archivo) | Auth requerida | Función |
|---|---|---|---|
| `GET` | `app/api/products/route.ts` | No (público) | Lista productos disponibles para el catálogo |
| `GET` | `app/api/products/[id]/route.ts` | No (público) | Detalle de un producto |
| `POST` | `app/api/products/route.ts` | Sí (Cloudflare Access) | Crear producto |
| `PUT` | `app/api/products/[id]/route.ts` | Sí (Cloudflare Access) | Editar producto |
| `DELETE` | `app/api/products/[id]/route.ts` | Sí (Cloudflare Access) | Eliminar producto |
| `POST` | `app/api/upload/route.ts` | Sí (Cloudflare Access) | Sube una imagen a R2, devuelve la URL pública |

Cada archivo de ruta protegida debe declarar `export const runtime = 'edge'` y validar el JWT de Cloudflare Access en el header de la request (vía middleware de Next.js, `middleware.ts` en la raíz, aplicado a `/admin/*` y `/api/products` en sus métodos de escritura). Esto evita que alguien llame la API directamente sin pasar por el login, sin importar que la lógica esté escrita en React/Next.js — la validación ocurre en el servidor/edge, no en el cliente.

---

## 6. Funcionalidades — Catálogo público

- Listado de gafas en grilla responsive (3 columnas desktop, 2 tablet, 1 celular)
- Cada tarjeta muestra: foto, nombre, precio (formateado en COP), botón "Me interesa"
- Botón "Me interesa" genera un link `https://wa.me/<number>?text=<message>` con:
  - Nombre del producto
  - Precio
  - (Opcional) link directo a la foto del producto
- Efecto de "enfoque": la imagen del producto se muestra con leve desenfoque y enfoca al hacer hover/touch (transición CSS, sin JS adicional)
- Estado vacío: si no hay productos disponibles, mensaje amigable en vez de grilla vacía
- Manejo de error si la API no responde (mensaje + botón de WhatsApp general como respaldo)
- SEO básico: metaetiquetas (title, description, Open Graph para que se vea bien al compartir en WhatsApp)
- Optimización de imágenes: Cloudflare Images/Polish o compresión al subir, para que cargue rápido en datos móviles

---

## 7. Funcionalidades — Panel de administración (`/admin`)

- Acceso solo tras autenticarse vía Cloudflare Access (correo + OTP)
- Vista de lista: todas las gafas con foto miniatura, nombre, precio, estado (disponible/oculto)
- Formulario de creación/edición:
  - Campo nombre (texto)
  - Campo precio (numérico, formateado en vivo)
  - Campo descripción (texto largo, opcional)
  - Subida de foto (drag & drop o selector de archivo) → se sube a R2 automáticamente
  - Switch "disponible / oculto"
- Botón eliminar con confirmación ("¿Seguro que quieres eliminar esta gafa?")
- Reordenar productos (drag & drop simple, actualiza el campo `sort_order`)
- Guardado instantáneo — sin necesidad de "publicar" ni esperar rebuild
- Diseño simple pensado para un usuario no técnico: textos claros, botones grandes, confirmaciones visuales ("Guardado ✓")

---

## 8. Diseño / Sistema visual (ya aprobado)

**Paleta:**
- Fondo: hueso cálido `#F4F2EA`
- Tinta / texto principal: azul marino oscuro `#182849`
- Acento primario (botones, CTA): azul cobalto `#3A5FA8`
- Acento secundario (detalles, hover): azul periwinkle claro `#8FAAD6`
- Texto secundario: gris grafito `#5B6472`
- Superficie de tarjetas: hueso claro `#FFFEFA`

**Tipografía:**
- Display/títulos: **Fraunces** (serif con eje óptico variable — peso 500, itálica para acentos como "con estilo")
- Cuerpo: **Work Sans** (400/500)
- Precios/datos: **IBM Plex Mono** (500) — le da un aire de "ficha técnica/receta óptica"

**Interacción firma:** fotos de producto con leve desenfoque en reposo, enfoque nítido al hover/touch — metáfora de "corregir la visión", único efecto especial, sin sobrecargar la interfaz.

**Responsive:** mobile-first. Breakpoints sugeridos: `480px`, `768px`, `1024px`.

---

## 9. Seguridad

- `/admin/*` protegido en el edge por Cloudflare Access (lista blanca de correos autorizados: dueño + tú)
- Rutas de escritura de la API (`POST`, `PUT`, `DELETE`, `/api/upload`) validan el JWT de Cloudflare Access en cada request
- Rutas de lectura (`GET /api/products`) públicas y de solo lectura
- Sin contraseñas propias que gestionar ni hashear
- Validación de inputs en el backend (precio numérico positivo, nombre no vacío, tamaño/formato de imagen permitido)
- Rate limiting básico en Cloudflare (incluido en el plan gratuito) para evitar abuso de la API pública

---

## 10. Infraestructura y despliegue

1. Repo en GitHub conectado a Cloudflare Pages (deploy automático en cada `git push` a `main`)
2. Cloudflare D1: base de datos creada y enlazada al proyecto de Pages
3. Cloudflare R2: bucket creado y enlazado, con acceso público de solo lectura para las imágenes
4. Cloudflare Access: aplicación configurada sobre la ruta `/admin/*`, política de acceso por correo (OTP)
5. Dominio: agregado y verificado en Cloudflare, SSL automático (Universal SSL)
6. Variables de entorno / bindings necesarios en Pages: binding a D1, binding a R2, número de WhatsApp de destino (como variable, no hardcodeado)

---

## 11. Estructura de archivos propuesta

```
optica-restrepo/
├── app/
│   ├── page.tsx                     # public catalog
│   ├── layout.tsx                   # root layout, fonts, metadata
│   ├── globals.css
│   ├── admin/
│   │   ├── page.tsx                 # product list (admin)
│   │   └── products/
│   │       ├── new/page.tsx         # creation form
│   │       └── [id]/page.tsx        # edit form
│   └── api/
│       ├── products/
│       │   ├── route.ts             # GET (list) and POST (create)
│       │   └── [id]/route.ts        # GET, PUT, DELETE by id
│       └── upload/route.ts          # image upload to R2
├── components/
│   ├── ProductCard.tsx               # catalog card (with focus effect)
│   ├── ProductForm.tsx               # shared create/edit form
│   └── WhatsAppButton.tsx            # generates the dynamic wa.me link
├── lib/
│   ├── db.ts                         # D1 access helpers
│   ├── r2.ts                         # R2 upload/read helpers
│   └── config.ts                     # WhatsApp number, business name, etc.
├── middleware.ts                     # validates Cloudflare Access JWT on protected routes
├── schema.sql                        # products table definition (D1)
├── wrangler.toml                     # bindings configuration (D1, R2)
├── next.config.js
└── README.md                         # deployment and usage instructions
```

---

## 12. Fuera de alcance (explícitamente)

- Pasarela de pagos (Wompi, PayU, Stripe, etc.) — no se implementa
- Carrito de compras / checkout — no aplica, es contacto directo por WhatsApp
- Cuentas de usuario para clientes — no se requiere login del comprador
- Notificaciones push o email automatizado — el contacto es 100% vía WhatsApp

---

## 13. Fases sugeridas de desarrollo

1. **Fase 1 — Fundacional:** estructura del repo, schema de D1, bindings de Cloudflare, deploy inicial "hola mundo" en Pages
2. **Fase 2 — Catálogo público:** endpoint `GET /api/products`, render de la grilla, diseño aplicado, responsive
3. **Fase 3 — WhatsApp:** generación dinámica de links `wa.me` por producto
4. **Fase 4 — Panel admin:** Cloudflare Access configurado, CRUD completo, subida de imágenes a R2
5. **Fase 5 — Pulido:** manejo de errores, estados vacíos, optimización de imágenes, SEO/Open Graph, pruebas en dispositivos reales
6. **Fase 6 — Dominio y salida a producción:** conexión de dominio propio, revisión final con el dueño del negocio

---

## 14. Datos pendientes antes de iniciar en Claude Code

- Número de WhatsApp de destino (con indicativo de país, sin `+` ni espacios: `57XXXXXXXXXX`)
- Correo(s) autorizados para el panel admin (Cloudflare Access)
- Nombre definitivo del negocio y logo (si existe)
- Dominio a usar (o confirmar que se compra en Cloudflare Registrar)
- Fotos iniciales del catálogo (o si se sube contenido de prueba mientras tanto)
