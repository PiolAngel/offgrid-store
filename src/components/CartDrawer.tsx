
"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart, getMaxQuantity } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  FREE_SHIPPING_THRESHOLD,
  DELIVERY_COST,
  formatPrice,
  hasFreeShipping,
} from "@/lib/pricing";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { catalogReady } = useStore();
  const {
    items,
    isCartOpen,
    totalItems,
    subtotal,
    closeCart,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const freeShipping = hasFreeShipping(subtotal);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );
  const deliveryCost = freeShipping ? 0 : DELIVERY_COST;

  useEffect(() => {
    if (!isCartOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-[#f5f1e9] text-[#211f1c] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#ded6ca] px-6 py-5">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#77716a]">
              OFFGRID / TU SELECCIÓN
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-tight">
              Tu carrito ({totalItems})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-10 w-10 items-center justify-center text-3xl text-[#77716a] transition-colors hover:text-[#211f1c]"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="text-4xl font-light">∅</span>
            <h3 className="mt-5 text-lg">Tu carrito está vacío</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#77716a]">
              Descubrí la colección y encontrá tu próximo favorito.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-7 bg-[#211f1c] px-7 py-4 text-xs tracking-[0.15em] text-[#f5f1e9] transition-colors hover:bg-[#45413b]"
            >
              EXPLORAR COLECCIÓN
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-xs text-[#77716a]">
                {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
              </p>

              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] tracking-wider text-[#77716a] underline underline-offset-4 hover:text-[#211f1c]"
              >
                VACIAR CARRITO
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-[#ded6ca]">
                {items.map((item) => {
                  const backgroundColor =
                    item.product.tone === "dark"
                      ? "#292929"
                      : item.product.tone === "grey"
                        ? "#d5d3ce"
                        : item.product.tone === "blue"
                          ? "#c4ccd2"
                          : item.product.tone === "sand"
                            ? "#d8cbb7"
                            : "#eeeae2";

                  const maxQuantity = getMaxQuantity(
                    item.product,
                    item.size,
                    item.color,
                  );
                  const atLimit = item.quantity >= maxQuantity;

                  return (
                    <article key={item.id} className="flex gap-4 py-5">
                      <div
                        className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden"
                        style={{ backgroundColor }}
                      >
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={96}
                            height={128}
                            sizes="96px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            className={`px-2 text-center text-[9px] tracking-[0.2em] ${
                              item.product.tone === "dark"
                                ? "text-[#f5f1e9]"
                                : "text-[#37342f]"
                            }`}
                          >
                            OFFGRID
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-medium">
                            {item.product.name}
                          </h3>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Eliminar ${item.product.name}`}
                            className="text-lg leading-none text-[#89837c] hover:text-[#211f1c]"
                          >
                            ×
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-[#77716a]">
                          Talle: {item.size}
                        </p>
                        <p className="mt-1 text-xs text-[#77716a]">
                          Color: {item.color}
                        </p>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                          <div className="flex h-8 items-center border border-[#d8d0c4]">
                            <button
                              type="button"
                              aria-label="Reducir cantidad"
                              onClick={() =>
                                setQuantity(item.id, item.quantity - 1)
                              }
                              className="h-full w-8 hover:bg-[#eae4da]"
                            >
                              −
                            </button>

                            <span className="w-7 text-center text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={
                                atLimit
                                  ? "Aumentar cantidad (límite alcanzado)"
                                  : "Aumentar cantidad"
                              }
                              disabled={atLimit}
                              onClick={() =>
                                setQuantity(item.id, item.quantity + 1)
                              }
                              className="h-full w-8 hover:bg-[#eae4da] disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <footer className="border-t border-[#ded6ca] bg-[#f5f1e9] px-6 pb-6 pt-5">
              <div
                className="mb-4 rounded-sm border border-[#ded6ca] bg-[#eee9df] px-3 py-3"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-tight text-[#211f1c]">
                    {freeShipping
                      ? "¡Conseguiste delivery gratis!"
                      : "Conseguí delivery gratis"}
                  </p>

                  <span className="shrink-0 text-xs font-semibold text-[#211f1c]">
                    {Math.round(shippingProgress)}%
                  </span>
                </div>

                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d8d0c4]"
                  role="progressbar"
                  aria-label="Progreso para conseguir delivery gratis"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING_THRESHOLD}
                  aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                >
                  <div
                    className="h-full rounded-full bg-[#292824] transition-[width] duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs font-medium text-[#37342f]">
                  {freeShipping
                    ? "Tu pedido ya tiene envío gratis."
                    : `Te faltan ${formatPrice(remainingForFreeShipping)}`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-lg font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#77716a]">Delivery</span>
                <span className="font-medium">
                  {deliveryCost === 0 ? "GRATIS" : formatPrice(deliveryCost)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#ded6ca] pt-3">
  <span className="text-sm font-semibold">Total</span>
  <span className="text-lg font-semibold">
    {formatPrice(subtotal + deliveryCost)}
  </span>
</div>

<button
  type="button"
  onClick={() => {
    closeCart();
    router.push("/checkout");
  }}
  disabled={!catalogReady}
  className="mt-5 min-h-14 w-full bg-[#211f1c] px-5 text-xs font-medium tracking-[0.15em] text-[#f5f1e9] transition-colors hover:bg-[#45413b] disabled:cursor-not-allowed disabled:opacity-50"
>
  {catalogReady ? "FINALIZAR COMPRA" : "VERIFICANDO DISPONIBILIDAD"}
</button>
{!catalogReady && <p role="status" className="mt-3 text-center text-xs text-[#77716a]">Estamos comprobando el stock en tiempo real.</p>}

<button
  type="button"
  onClick={closeCart}
  className="mt-3 min-h-11 w-full text-xs tracking-wider text-[#77716a] underline underline-offset-4 hover:text-[#211f1c]"
>
  SEGUIR COMPRANDO
</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
