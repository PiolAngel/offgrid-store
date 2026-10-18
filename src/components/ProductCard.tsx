"use client";

import { useState } from "react";
import type { Product } from "@/types";
import ProductModal from "@/components/ProductModal";

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number) {
  return `Gs. ${price.toLocaleString("es-PY")}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const backgroundColor =
    product.tone === "dark"
      ? "#292929"
      : product.tone === "grey"
        ? "#d5d3ce"
        : product.tone === "blue"
          ? "#c4ccd2"
          : product.tone === "sand"
            ? "#d8cbb7"
            : "#eeeae2";

  const textColor =
    product.tone === "dark" ? "#f5f1e9" : "#37342f";

  return (
    <>
      <article className="group min-w-0">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={`Ver detalles de ${product.name}`}
          className={`relative block w-full overflow-hidden rounded-sm text-left ${
  product.slug === "beige-sneakers" ? "aspect-[3/5]" : "aspect-[3/4]"
}`}
          style={{ backgroundColor }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
              <span
                className="text-center text-xs tracking-[0.3em]"
                style={{ color: textColor }}
              >
                OFFGRID
              </span>

              <span
                className="text-center text-[10px] uppercase tracking-[0.18em] opacity-60"
                style={{ color: textColor }}
              >
                {product.name}
              </span>
            </div>
          )}

          {product.tag && (
            <span className="absolute left-3 top-3 bg-[#f5f1e9] px-2.5 py-1 text-[10px] font-medium tracking-wider text-[#211f1c]">
              {product.tag}
            </span>
          )}

          <span className="absolute bottom-3 left-3 right-3 bg-[#211f1c] px-3 py-3 text-center text-xs font-medium tracking-wider text-[#f5f1e9] transition-colors group-hover:bg-[#45413b]">
            VER PRODUCTO +
          </span>
        </button>

        <div className="space-y-1.5 pt-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-left text-sm font-medium tracking-wide text-[#211f1c]"
          >
            {product.name}
          </button>

          <p className="text-xs leading-relaxed text-[#77716a]">
            {product.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm font-medium text-[#211f1c]">
              {formatPrice(product.price)}
            </span>

            {product.compareAtPrice && (
              <span className="text-xs text-[#89837c] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </article>

      {isModalOpen && (
        <ProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}