"use client";

import { usePathname } from "next/navigation";

export default function DemoNotice() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <div role="note" className="bg-[#292824] px-4 py-2 text-center text-[11px] leading-relaxed tracking-wide text-[#f5f1e9]">
      <strong className="mr-2 tracking-[0.17em]">OFFGRID · DEMO</strong>
      Sitio de demostración de una agencia web. Productos, stock, precios y pedidos ficticios. No ingreses datos personales reales.
    </div>
  );
}
