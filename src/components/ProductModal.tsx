
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { useCart, MAX_QUANTITY } from "@/context/CartContext";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function formatPrice(price: number) {
  return `Gs. ${price.toLocaleString("es-PY")}`;
}

function getSizes(product: Product) {
  if (product.category === "sneakers") {
    return ["38", "39", "40", "41", "42", "43"];
  }

  if (product.category === "pantalones") {
    return ["28", "30", "32", "34", "36"];
  }

  if (product.category === "accesorios") {
    return ["Único"];
  }

  return ["S", "M", "L", "XL"];
}

function ProductModalContent({
  product,
  onClose,
}: ProductModalProps) {
  const { addItem } = useCart();
   const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);



  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const variants = product.variants ?? [];
const activeVariant =
  variants.find((variant) => variant.color === color) ?? variants[0];

const sizes = activeVariant?.sizes ?? getSizes(product);
const gallery = activeVariant?.gallery ?? product.gallery ?? [];
const mainImage =
  gallery[selectedImage] ?? activeVariant?.image ?? product.image;

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

  const imageTextColor =
    product.tone === "dark" ? "#f5f1e9" : "#37342f";

  function handleAddToCart() {
  if (!product || !size || !color) return;

  for (let i = 0; i < quantity; i++) {
    addItem(product, size, color);
  }

  onClose();
}

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${product.name}`}
        className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto bg-[#f5f1e9] text-[#211f1c] sm:rounded-sm"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar producto"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f1e9]/90 text-2xl hover:bg-white"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2">
          <div className="flex flex-col" style={{ backgroundColor }}>
            <div className="flex min-h-[280px] items-center justify-center md:min-h-[520px]">
              {mainImage ? (
  <img
    src={mainImage}
    alt={`${product.name} — vista ${selectedImage + 1}`}
    className="h-full max-h-[520px] min-h-[280px] w-full object-cover"
  />
) : (
  <div className="flex flex-col items-center gap-4 p-8 text-center">
    <span
      className="text-sm tracking-[0.4em]"
      style={{ color: imageTextColor }}
    >
      OFFGRID
    </span>
    <span
      className="text-xs uppercase tracking-[0.2em] opacity-60"
      style={{ color: imageTextColor }}
    >
      {product.name}
    </span>
  </div>
)}
            </div>

            {gallery.length > 1 && (
  <div className="flex justify-center gap-3 px-4 py-4">
    {gallery.map((image, index) => (
      <button
        key={image}
        type="button"
        onClick={() => setSelectedImage(index)}
        aria-label={`Ver imagen ${index + 1} de ${product.name}`}
        aria-pressed={selectedImage === index}
        className={`h-16 w-16 overflow-hidden border-2 transition-opacity sm:h-20 sm:w-20 ${
          selectedImage === index
            ? "border-[#211f1c]"
            : "border-transparent opacity-60 hover:opacity-100"
        }`}
      >
        <img
          src={image}
          alt={`${product.name} — miniatura ${index + 1}`}
          className="h-full w-full object-cover"
        />
      </button>
    ))}
  </div>
)}
          </div>
          <div className="flex flex-col p-6 sm:p-9 md:justify-center">
            <p className="text-[10px] tracking-[0.25em] text-[#77716a]">
              OFFGRID / COLECCIÓN
            </p>

            {product.tag && (
              <span className="mt-4 w-fit border border-[#b9afa0] px-2 py-1 text-[10px] tracking-wider">
                {product.tag}
              </span>
            )}

            <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
              {product.name}
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-lg">
                {formatPrice(product.price)}
              </span>

              {product.compareAtPrice && (
                <span className="text-sm text-[#89837c] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-7 text-[#77716a]">
              {product.description}
            </p>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-medium tracking-wider">
                  TALLE
                </label>
                <span className="text-xs text-[#77716a]">
                  {size || "Seleccioná un talle"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={`min-w-12 border px-3 py-3 text-xs transition-colors ${
                      size === option
                        ? "border-[#211f1c] bg-[#211f1c] text-[#f5f1e9]"
                        : "border-[#d8d0c4] hover:border-[#211f1c]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-medium tracking-wider">
                COLOR · {color}
              </p>

              <div className="flex gap-3">
                {variants.map((option) => (
  <button
    key={option.color}
    type="button"
    onClick={() => {
  const colorChanged = option.color !== color;

  setColor(option.color);

  setSize(
    option.sizes?.includes(size)
      ? size
      : option.sizes?.[0] ?? getSizes(product)[0]
  );

  if (colorChanged) {
    setSelectedImage(0);
  }
}}
    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all duration-200 hover:border-black hover:bg-black/5 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
  color === option.color
    ? "border-black bg-black/5"
    : "border-transparent"
}`}
    aria-pressed={color === option.color}
  >
    <span
      className="h-5 w-5 rounded-full border border-black/10"
      style={{ backgroundColor: option.colorValue }}
    />
    {option.color}
  </button>
))}
              </div>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-12 items-center border border-[#d8d0c4]">
                <button
                  type="button"
                  aria-label="Reducir cantidad"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="h-full w-10 text-lg hover:bg-[#eae4da]"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  disabled={quantity >= MAX_QUANTITY}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(MAX_QUANTITY, current + 1),
                    )
                  }
                  className="h-full w-10 text-lg hover:bg-[#eae4da] disabled:opacity-30"
                >
                  +
                </button>
              </div>

            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 min-h-14 w-full bg-[#211f1c] px-5 text-xs font-medium tracking-[0.16em] text-[#f5f1e9] transition-colors hover:bg-[#45413b]"
            >
              AGREGAR AL CARRITO · {formatPrice(product.price * quantity)}
            </button>

            <p className="mt-4 text-center text-[10px] tracking-wide text-[#89837c]">
              ESTILO QUE HABLA POR VOS.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


export default function ProductModal(props: ProductModalProps) {
  if (!props.product) return null;

  return (
    <ProductModalContent
      key={props.product.id}
      product={props.product}
      onClose={props.onClose}
    />
  );
}
