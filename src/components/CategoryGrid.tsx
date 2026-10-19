"use client";

import { selectCategory } from "@/lib/category-events";
import type { CategoryId } from "@/types";

const CATEGORY_TILES: { id: CategoryId; label: string }[] = [
  { id: "sneakers", label: "Sneakers" },
  { id: "remeras", label: "Remeras" },
  { id: "pantalones", label: "Pantalones" },
  { id: "hoodies", label: "Hoodies" },
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export default function CategoryGrid() {
  return (
    <section
      id="categorias"
      aria-labelledby="categorias-titulo"
      className="border-t border-ink/10 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Categorías
        </p>
        <h2
          id="categorias-titulo"
          className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl"
        >
          Comprá por <span className="italic">categoría.</span>
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CATEGORY_TILES.map((tile, index) => (
            <li key={tile.id}>
              <a
                href="#catalogo"
                onClick={() => selectCategory(tile.id)}
                className="group flex aspect-[4/5] flex-col justify-between border border-ink/15 bg-sand p-5 text-ink transition-colors duration-300 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream"
              >
                <span className="text-[11px] font-medium tracking-[0.22em]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>
                  <span className="block font-serif text-3xl leading-none sm:text-4xl">
                    {tile.label}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] opacity-75">
                    Ver productos
                    <ArrowIcon />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}