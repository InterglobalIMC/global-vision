#!/bin/bash
set -e

echo "🔧 Global Vision — Setup Cloudflare Resources"
echo "=============================================="
echo ""

# Check if wrangler is logged in
echo "1. Verificando autenticación de Cloudflare..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "❌ No estás autenticado con Cloudflare."
  echo "   Ejecutá: npx wrangler login"
  exit 1
fi
echo "✅ Autenticado correctamente."
echo ""

# Create D1 database
echo "2. Creando base de datos D1..."
D1_OUTPUT=$(npx wrangler d1 create global-vision-db 2>&1)
echo "$D1_OUTPUT"

# Extract database_id from output
DB_ID=$(echo "$D1_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
if [ -z "$DB_ID" ]; then
  echo "❌ No se pudo extraer el database_id."
  exit 1
fi
echo "✅ D1 creado: $DB_ID"
echo ""

# Create R2 bucket
echo "3. Creando bucket R2..."
npx wrangler r2 bucket create global-vision-images 2>&1 || echo "⚠️  Bucket ya existe o error (continuando...)"
echo "✅ Bucket R2 configurado."
echo ""

# Update wrangler.jsonc with actual database_id
echo "4. Actualizando wrangler.jsonc con el database_id real..."
sed -i "s/placeholder-replace-with-actual-id/$DB_ID/" wrangler.jsonc
echo "✅ wrangler.jsonc actualizado."
echo ""

# Run schema migration
echo "5. Ejecutando schema SQL en D1..."
npx wrangler d1 execute global-vision-db --file=schema.sql 2>&1
echo "✅ Schema ejecutado."
echo ""

# Deploy
echo "6. Desplegando a Cloudflare Workers..."
npx opennextjs-cloudflare deploy 2>&1
echo ""
echo "=============================================="
echo "✅ ¡Deploy completado!"
echo "=============================================="
