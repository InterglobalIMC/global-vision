"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  available: boolean;
  sort_order: number;
}

function getImageUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("/api/images/")) return key;
  return `/api/images/${key}`;
}

function formatPriceInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  return numbers;
}

function formatPriceDisplay(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductForm({
  product,
  mode,
}: {
  product?: Product;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price || 0,
    description: product?.description || "",
    image_url: product?.image_url || "",
    available: product?.available ?? true,
    sort_order: product?.sort_order || 0,
  });

  const [priceDisplay, setPriceDisplay] = useState(
    product?.price ? product.price.toString() : ""
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = formatPriceInput(e.target.value);
    setPriceDisplay(raw);
    setForm((prev) => ({ ...prev, price: parseInt(raw) || 0 }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Solo se permiten imágenes" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "La imagen no puede superar 5MB" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data: { key?: string } = await res.json();
      setForm((prev) => ({ ...prev, image_url: data.key || "" }));
      setMessage({ type: "success", text: "Imagen subida correctamente" });
    } catch {
      setMessage({ type: "error", text: "Error al subir la imagen" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url =
        mode === "create" ? "/api/products" : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setMessage({ type: "success", text: "Guardado ✓" });
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#182849] mb-2">
          Nombre de la montura *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A5FA8] focus:ring-2 focus:ring-[#3A5FA8]/20 outline-none transition-all text-[#182849]"
          placeholder="Ej: Montura Clásica Azul"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#182849] mb-2">
          Precio (COP) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6472] font-[family-name:var(--font-mono)]">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={priceDisplay}
            onChange={handlePriceChange}
            required
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A5FA8] focus:ring-2 focus:ring-[#3A5FA8]/20 outline-none transition-all font-[family-name:var(--font-mono)] text-[#182849]"
            placeholder="0"
          />
        </div>
        {form.price > 0 && (
          <p className="mt-1 text-sm text-[#5B6472] font-[family-name:var(--font-mono)]">
            {formatPriceDisplay(form.price)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#182849] mb-2">
          Descripción
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A5FA8] focus:ring-2 focus:ring-[#3A5FA8]/20 outline-none transition-all text-[#182849] resize-none"
          placeholder="Descripción opcional de la montura"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#182849] mb-2">
          Foto del producto
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-[#3A5FA8] bg-[#3A5FA8]/5"
              : "border-gray-200 hover:border-[#8FAAD6]"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex items-center justify-center gap-2 text-[#5B6472]">
              <svg
                className="animate-spin h-5 w-5"
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
              Subiendo...
            </div>
          ) : form.image_url ? (
            <div className="space-y-3">
              <img
                src={getImageUrl(form.image_url)}
                alt="Preview"
                className="mx-auto h-32 w-32 object-cover rounded-lg"
              />
              <p className="text-sm text-[#5B6472]">
                Click o arrastra para cambiar
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-[#5B6472]">
              <svg
                className="mx-auto h-10 w-10"
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
              <p className="text-sm">
                Arrastra una imagen o click para seleccionar
              </p>
              <p className="text-xs">JPG, PNG, WebP (máx. 5MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#F4F2EA] rounded-xl">
        <div>
          <p className="font-medium text-[#182849]">Disponible</p>
          <p className="text-sm text-[#5B6472]">
            {form.available ? "Visible en el catálogo" : "Oculto del catálogo"}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, available: !prev.available }))
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            form.available ? "bg-[#3A5FA8]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              form.available ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-[#5B6472] font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 py-3 px-4 rounded-xl bg-[#3A5FA8] text-white font-medium hover:bg-[#182849] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Guardando..."
            : mode === "create"
              ? "Crear montura"
              : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
