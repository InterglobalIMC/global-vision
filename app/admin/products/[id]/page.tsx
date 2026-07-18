import ProductForm from "@/components/ProductForm";
import { getDB } from "@/lib/db";

export const metadata = {
  title: "Editar montura — Global Vision Admin",
};

async function getProduct(id: string): Promise<{
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  available: number;
  sort_order: number;
} | null> {
  try {
    const db = getDB();
    const product = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(Number(id))
      .first<{
        id: number;
        name: string;
        price: number;
        description: string | null;
        image_url: string | null;
        available: number;
        sort_order: number;
      }>();

    return product || null;
  } catch {
    return null;
  }
}

export default async function EditProductPage({
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
          <a
            href="/admin"
            className="text-[#3A5FA8] hover:underline"
          >
            Volver al panel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EA]">
      <header className="bg-[#FFFEFA] border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#182849]">
            Editar montura
          </h1>
          <p className="text-sm text-[#5B6472]">{product.name}</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#FFFEFA] rounded-2xl p-6">
          <ProductForm
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              description: product.description || "",
              image_url: product.image_url || "",
              available: Boolean(product.available),
              sort_order: product.sort_order || 0,
            }}
            mode="edit"
          />
        </div>
      </main>
    </div>
  );
}
