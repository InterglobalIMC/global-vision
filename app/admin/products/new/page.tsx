import ProductForm from "@/components/ProductForm";

export const metadata = {
  title: "Nueva montura — Global Vision Admin",
};

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#F4F2EA]">
      <header className="bg-[#FFFEFA] border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#182849]">
            Nueva montura
          </h1>
          <p className="text-sm text-[#5B6472]">Agregar al catálogo</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#FFFEFA] rounded-2xl p-6">
          <ProductForm mode="create" />
        </div>
      </main>
    </div>
  );
}
