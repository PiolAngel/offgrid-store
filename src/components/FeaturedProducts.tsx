
"use client";

import ProductCard from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";

/** Máximo de productos que se muestran en esta sección. */
const MAX_FEATURED = 8;

export default function FeaturedProducts() {
  const { isProductActive, products: currentProducts, catalogReady } = useStore();

  const featured = currentProducts
    .filter((product) => product.featured && isProductActive(product.id))
    .slice(0, MAX_FEATURED);

  // El destino #destacados debe existir incluso antes de recibir Supabase.
  // De lo contrario, un clic temprano no encuentra su ancla.
  if (!catalogReady || featured.length === 0) {
    return <section id="destacados" aria-label="Productos destacados" />;
  }

  return (
    <section
      id="destacados"
      aria-labelledby="destacados-titulo"
      className="border-t border-ink/10 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
              Selección
            </p>
            <h2
              id="destacados-titulo"
              className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl"
            >
              Productos <span className="italic">destacados.</span>
            </h2>
          </div>

          <a
            href="#catalogo"
            className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink underline underline-offset-4"
          >
            Ver todo el catálogo
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
