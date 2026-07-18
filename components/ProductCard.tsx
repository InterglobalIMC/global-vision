"use client";

import WhatsAppButton from "./WhatsAppButton";

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <a href={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={`Montura ${product.name}`}
              width={400}
              height={400}
              className="product-card w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F4F2EA] text-[#5B6472]">
              <svg
                className="w-16 h-16 opacity-40"
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

        <div className="p-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#182849] leading-tight">
            {product.name}
          </h3>

          <p className="font-[family-name:var(--font-mono)] text-xl font-medium text-[#3A5FA8] mt-2">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="text-sm text-[#5B6472] mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </a>

      <div className="px-4 pb-4">
        <WhatsAppButton product={product} />
      </div>
    </div>
  );
}
