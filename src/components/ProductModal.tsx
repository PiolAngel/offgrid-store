"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product, ProductVariant } from "@/types";
import { useCart, MAX_QUANTITY } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/pricing";
import {
  buildProductInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
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

/**
 * Unidades disponibles de un talle en una variante de color.
 * Devuelve undefined cuando el stock no está definido: en ese caso no hay control de stock.
 */
function getSizeStock(
  variant: ProductVariant | undefined,
  sizeOption: string,
): number | undefined {
  const value = variant?.stock?.[sizeOption];

  if (typeof value !== "number" || !Number.isFinite(value)) return 0;

  return Math.max(0, Math.floor(value));
}

function isSizeSoldOut(
  variant: ProductVariant | undefined,
  sizeOption: string,
): boolean {
  const available = getSizeStock(variant, sizeOption);
  return available !== undefined && available <= 0;
}

function ProductModalContent({
  product,
  onClose,
}: ProductModalProps) {
  const { addItem, items } = useCart();
  const { catalogReady } = useStore();
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

  // Variante elegida por el cliente. Es undefined hasta que elige un color.
  const selectedVariant = variants.find((variant) => variant.color === color);

  // Solo para la vista previa: mientras no hay color elegido se muestran las
  // imágenes del primer color, sin seleccionarlo.
  const visualVariant = selectedVariant ?? variants[0];

  // Los talles salen exclusivamente del color elegido.
  const sizes = selectedVariant
    ? (selectedVariant.sizes ?? getSizes(product))
    : [];

  const gallery = visualVariant?.gallery ?? product.gallery ?? [];
  const mainImage =
    gallery[selectedImage] ?? visualVariant?.image ?? product.image;

  // --- Inventario por variante ---
  const selectedStock =
    selectedVariant && size ? getSizeStock(selectedVariant, size) : undefined;

  // Unidades de esta misma combinación (producto + talle + color) que ya están en el carrito.
  const unitsInCart =
    selectedVariant && size
      ? items
          .filter(
            (item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color === selectedVariant.color,
          )
          .reduce((total, item) => total + item.quantity, 0)
      : 0;

  // Sin stock definido se conserva el comportamiento anterior (tope: MAX_QUANTITY).
  const availableUnits =
    selectedStock === undefined
      ? 0
      : Math.max(0, selectedStock - unitsInCart);

  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, availableUnits));
  const safeQuantity = Math.min(quantity, maxQuantity);

  const allSoldOut =
    selectedVariant !== undefined &&
    sizes.length > 0 &&
    sizes.every((option) => isSizeSoldOut(selectedVariant, option));
  const anySoldOut =
    selectedVariant !== undefined &&
    sizes.some((option) => isSizeSoldOut(selectedVariant, option));
  const outOfUnits = size !== "" && availableUnits <= 0;

  // No se puede agregar hasta tener un color y un talle válidos.
  const addDisabled =
    !catalogReady || selectedVariant === undefined || size === "" || allSoldOut || outOfUnits;

  const lowStockLabel =
    selectedStock !== undefined && selectedStock >= 1 && selectedStock <= 9
      ? selectedStock === 1
        ? "Última unidad"
        : `Últimas ${selectedStock} unidades`
      : null;

  const addButtonLabel = !catalogReady
    ? "COMPROBANDO DISPONIBILIDAD"
    : !selectedVariant
    ? "ELEGÍ UN COLOR"
    : allSoldOut
      ? "AGOTADO"
      : size === ""
        ? "ELEGÍ UN TALLE"
        : outOfUnits
          ? "SIN MÁS UNIDADES DISPONIBLES"
          : `AGREGAR AL CARRITO · ${formatPrice(product.price * safeQuantity)}`;

  const baseBackgroundColor =
    product.tone === "dark"
      ? "#292929"
      : product.tone === "grey"
        ? "#d5d3ce"
        : product.tone === "blue"
          ? "#c4ccd2"
          : product.tone === "sand"
            ? "#d8cbb7"
            : "#eeeae2";

  const variantBackgrounds: Record<string, string> = {
    Negro: "#292929",
    Gris: "#d5d3ce",
    "Azul marino": "#c4ccd2",
    Azul: "#c4ccd2",
    "Verde oliva": "#d8d9ca",
    Beige: "#d8cbb7",
    Blanco: "#f5f5f2",
    Crema: "#d8cbb7",
  };

  const backgroundColor =
    product.name === "Denim Straight" && selectedVariant?.color === "Negro"
      ? "#f0eee9"
      : product.name === "Zip Hoodie Cream"
        ? baseBackgroundColor
        : selectedVariant
          ? variantBackgrounds[selectedVariant.color] ?? baseBackgroundColor
          : baseBackgroundColor;

  const imageTextColor =
    backgroundColor === "#292929" ? "#f5f1e9" : "#37342f";

  function handleSelectColor(option: ProductVariant) {
    // Tocar el color que ya está elegido no cambia nada.
    if (option.color === color) return;

    setColor(option.color);
    // El talle se reinicia: el cliente elige de nuevo según el stock del nuevo color.
    setSize("");
    setQuantity(1);
    setSelectedImage(0);
  }

  function handleSelectSize(option: string) {
    if (isSizeSoldOut(selectedVariant, option)) return;

    setSize(option);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!product || !selectedVariant || !size || addDisabled) return;
    if (!sizes.includes(size) || isSizeSoldOut(selectedVariant, size)) return;

    let added = 0;
    for (let i = 0; i < safeQuantity; i++) {
      if (addItem(product, size, selectedVariant.color)) added++;
      else break;
    }

    if (added > 0) onClose();
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
                <Image
                  src={mainImage}
                  alt={`${product.name} — vista ${selectedImage + 1}`}
                  width={900}
                  height={1100}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="eager"
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
              <div className="flex justify-center gap-3 border-t border-black/10 bg-[#e5e1d9] px-4 py-4">
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
                    <Image
                      src={image}
                      alt={`${product.name} — miniatura ${index + 1}`}
                      width={80}
                      height={80}
                      sizes="80px"
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

            {/* 1. Color */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-medium tracking-wider">
                COLOR · {color || "Seleccioná un color"}
              </p>

              <div className="flex flex-wrap gap-3">
                {variants.map((option) => {
  const optionSizes = option.sizes ?? getSizes(product);
  const colorSoldOut =
    optionSizes.length > 0 &&
    optionSizes.every((item) => isSizeSoldOut(option, item));

  return (
    <button
      key={option.color}
      type="button"
      onClick={() => handleSelectColor(option)}
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all duration-200 hover:border-black hover:bg-black/5 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
        color === option.color
          ? "border-black bg-black/5"
          : "border-transparent"
      } ${colorSoldOut ? "opacity-60" : ""}`}
      aria-pressed={color === option.color}
    >
      <span
        className="h-5 w-5 rounded-full border border-black/10"
        style={{ backgroundColor: option.colorValue }}
      />
      {option.color}
      {colorSoldOut && (
        <span className="text-[10px] font-semibold tracking-wide text-red-700">
          AGOTADO
        </span>
      )}
    </button>
  );
})}
              </div>
            </div>

            {/* 2. Talle: solo después de elegir un color */}
            {selectedVariant && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-medium tracking-wider">
                    TALLE
                  </label>
                  <span className="text-xs text-[#77716a]">
                    {size || (allSoldOut ? "Sin stock" : "Seleccioná un talle")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((option) => {
  const soldOut = isSizeSoldOut(selectedVariant, option);
  const optionStock = getSizeStock(selectedVariant, option);
  const isLow = optionStock !== undefined && optionStock >= 1 && optionStock < 10;

  return (
    <button
      key={option}
      type="button"
      disabled={soldOut}
      onClick={() => handleSelectSize(option)}
      aria-pressed={size === option}
      aria-label={
        soldOut
          ? `${option}, agotado`
          : isLow
            ? `${option}, pocas unidades`
            : undefined
      }
      className={`min-h-11 min-w-12 border px-3 py-3 text-xs transition-colors ${
        soldOut
          ? "cursor-not-allowed border-[#e3dccf] text-[#a39d94] line-through"
          : size === option
            ? "border-[#211f1c] bg-[#211f1c] text-[#f5f1e9]"
            : "border-[#d8d0c4] hover:border-[#211f1c]"
      }`}
    >
      {option}
      {isLow && (
        <span
          aria-hidden="true"
          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-600 align-middle"
        />
      )}
    </button>
  );
})}
                </div>

                {anySoldOut && (
                  <p className="mt-3 text-[11px] text-[#77716a]">
                    Los talles tachados están agotados.
                  </p>
                )}

                {lowStockLabel && (
  <p
    role="status"
    className="mt-3 inline-flex items-center gap-2 rounded-sm bg-red-50 px-2.5 py-1.5 text-xs font-semibold tracking-wide text-red-700 ring-1 ring-red-200"
  >
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red-600" />
    {lowStockLabel}
  </p>
)}
              </div>
            )}

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
                  {safeQuantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  disabled={addDisabled || safeQuantity >= maxQuantity}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(maxQuantity, current + 1),
                    )
                  }
                  className="h-full w-10 text-lg hover:bg-[#eae4da] disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {outOfUnits && !allSoldOut && (
              <p role="status" className="mt-3 text-xs text-[#77716a]">
                Ya tenés en el carrito todas las unidades disponibles de este talle.
              </p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addDisabled}
              className="mt-6 min-h-14 w-full bg-[#211f1c] px-5 text-xs font-medium tracking-[0.16em] text-[#f5f1e9] transition-colors enabled:hover:bg-[#45413b] disabled:cursor-not-allowed disabled:bg-[#b7b0a6]"
            >
              {addButtonLabel}
            </button>

<a
  href={buildWhatsAppUrl(
    buildProductInquiryMessage({
      name: product.name,
      price: product.price,
      color: selectedVariant?.color,
      size: size || undefined,
    }),
  )}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 flex min-h-12 w-full items-center justify-center border border-[#211f1c] px-5 text-xs font-medium tracking-[0.16em] transition-colors hover:bg-[#211f1c] hover:text-[#f5f1e9]"
>
  CONSULTAR POR WHATSAPP
</a>

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