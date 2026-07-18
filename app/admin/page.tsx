"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function getImageUrl(key: string): string {
  if (key.startsWith("/api/images/")) return key;
  return `/api/images/${key}`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data: { results?: Product[] } = await res.json();
      setProducts(data.results || []);
    } catch {
      setMessage({ type: "error", text: "Error al cargar productos" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ type: "success", text: "Producto eliminado" });
    } catch {
      setMessage({ type: "error", text: "Error al eliminar producto" });
    } finally {
      setDeleteId(null);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, available: p.available ? 0 : 1 }
            : p
        )
      );
    } catch {
      setMessage({ type: "error", text: "Error al actualizar producto" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2EA]">
      <header className="bg-[#FFFEFA] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#182849]">
              Panel de administración
            </h1>
            <p className="text-sm text-[#5B6472]">Global Vision</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#3A5FA8] hover:bg-[#182849] text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva montura
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#5B6472]">
            <svg
              className="animate-spin h-8 w-8 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Cargando...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[#FFFEFA] rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F4F2EA] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#8FAAD6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#182849] mb-2">
              Sin productos
            </h2>
            <p className="text-[#5B6472] mb-6">
              Agregá tu primera montura al catálogo
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-[#3A5FA8] hover:bg-[#182849] text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear primera montura
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-[#FFFEFA] rounded-2xl p-4 flex items-center gap-4 ${
                  !product.available ? "opacity-60" : ""
                }`}
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#F4F2EA]">
                  {product.image_url ? (
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#8FAAD6]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#182849] truncate">
                    {product.name}
                  </h3>
                  <p className="font-[family-name:var(--font-mono)] text-sm text-[#3A5FA8]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-xs text-[#5B6472] mt-0.5">
                    {product.available ? "Visible" : "Oculto"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(product)}
                    className="p-2 rounded-lg hover:bg-[#F4F2EA] transition-colors"
                    title={
                      product.available ? "Ocultar" : "Mostrar"
                    }
                  >
                    {product.available ? (
                      <svg
                        className="w-5 h-5 text-[#5B6472]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-[#5B6472]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className="p-2 rounded-lg hover:bg-[#F4F2EA] transition-colors"
                    title="Editar"
                  >
                    <svg
                      className="w-5 h-5 text-[#5B6472]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>

                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFEFA] rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#182849] mb-2">
                ¿Eliminar montura?
              </h3>
              <p className="text-[#5B6472] mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-[#5B6472] font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
