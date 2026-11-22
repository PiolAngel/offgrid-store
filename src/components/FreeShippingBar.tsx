"use client";

import { useCart } from "@/context/CartContext";
import {
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
} from "@/lib/pricing";

export default function FreeShippingBar() {
  const { subtotal } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="bg-[#211f1c] px-4 py-2 text-[#f5f1e9]">
      <p className="text-center text-[10px] font-medium tracking-[0.12em] sm:text-xs">
        {freeShipping
          ? "¡FELICIDADES! TENÉS DELIVERY GRATIS"
          : `DELIVERY GRATIS DESDE Gs. 500.000 · TE FALTAN ${formatPrice(remaining)}`}
      </p>
      <div className="mx-auto mt-1.5 h-0.5 max-w-3xl overflow-hidden bg-white/20">
        <div
          className="h-full bg-[#d8cbb7] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}