import WhatsAppButton from "@/components/WhatsAppButton";
import { getDB } from "@/lib/db";
import { getImageUrl } from "@/lib/r2";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  available: number;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const db = getDB();
    const product = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(Number(id))
      .first<Product>();

    if (!product) return null;

    return {
      ...product,
      image_url: product.image_url ? getImageUrl(product.image_url) : null,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Producto no encontrado — Global Vision" };
  }

  return {
    title: `${product.name} — Global Vision`,
    description: product.description || `Montura ${product.name} - ${product.price} COP`,
    openGraph: product.image_url
      ? {
          images: [{ url: product.image_url, width: 800, height: 800 }],
        }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4F2EA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#182849] mb-2">
            Montura no encontrada
          </h1>
          <a href="/" className="text-[#3A5FA8] hover:underline">
            Volver al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EA]">
      <header className="py-4 px-4">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#5B6472] hover:text-[#3A5FA8] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </a>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden shadow-sm">
          {product.image_url && (
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.image_url}
                alt={`Montura ${product.name}`}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#182849]">
              {product.name}
            </h1>

            <p className="font-[family-name:var(--font-mono)] text-2xl font-medium text-[#3A5FA8] mt-3">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>

            {product.description && (
              <p className="text-[#5B6472] mt-4 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-6">
              <WhatsAppButton product={product} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
