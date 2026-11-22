
"use client";

import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useProductFilter } from "@/hooks/useProductFilter";
import { CATEGORY_SELECT_EVENT } from "@/lib/category-events";
import { useStore } from "@/context/StoreContext";

export default function Catalog() {
  const { products, isProductActive } = useStore();
  const {
    query,
    setQuery,
    category,
    setCategory,
    priceRange,
    setPriceRange,
    categories,
    filteredProducts: allFilteredProducts,
    resetFilters,
  } = useProductFilter(products);

const filteredProducts = allFilteredProducts.filter((product) =>
  isProductActive(product.id),
);
  // Escucha los clics de la sección Categorías y aplica el filtro elegido.
  useEffect(() => {
    function handleSelect(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (categories.some((item) => item.id === id)) {
        setCategory(id as typeof category);
      }
    }

    window.addEventListener(CATEGORY_SELECT_EVENT, handleSelect);
    return () => window.removeEventListener(CATEGORY_SELECT_EVENT, handleSelect);
  }, [categories, setCategory]);
  return (
    <section
      id="catalogo"
      className="bg-[#f5f1e9] px-5 py-16 text-[#211f1c] sm:px-8 sm:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] tracking-[0.3em] text-[#77716a]">
              ENCONTRÁ TU ESTILO
            </p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              SHOP ALL<span className="text-[#8b8378]">.</span>
            </h2>
            <p className="mt-2 text-sm text-[#77716a]">
              Básicos esenciales. Estilo sin esfuerzo.
            </p>
          </div>

          <p className="text-xs tracking-wider text-[#77716a]">
            {filteredProducts.length} PRODUCTOS
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-[10px] tracking-widest text-[#77716a]">
            BUSCAR
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar productos..."
              className="h-11 rounded-sm border border-[#d9d2c7] bg-transparent px-3 text-sm tracking-normal text-[#211f1c] outline-none focus:border-[#211f1c]"
            />
          </label>

          <label className="flex flex-col gap-2 text-[10px] tracking-widest text-[#77716a]">
            CATEGORÍA
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as typeof category
                )
              }
              className="h-11 rounded-sm border border-[#d9d2c7] bg-transparent px-3 text-sm tracking-normal text-[#211f1c] outline-none focus:border-[#211f1c]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-[10px] tracking-widest text-[#77716a]">
            PRECIO
            <select
              value={priceRange}
              onChange={(event) =>
                setPriceRange(
                  event.target.value as typeof priceRange
                )
              }
              className="h-11 rounded-sm border border-[#d9d2c7] bg-transparent px-3 text-sm tracking-normal text-[#211f1c] outline-none focus:border-[#211f1c]"
            >
              <option value="all">Todos los precios</option>
              <option value="under-300">Menos de Gs. 300.000</option>
              <option value="300-500">Gs. 300.000 – 499.999</option>
              <option value="over-500">Gs. 500.000 o más</option>
            </select>
          </label>
        </div>

        {(query || category !== "all" || priceRange !== "all") && (
          <div className="mb-6">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs underline underline-offset-4"
            >
              Limpiar filtros ×
            </button>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg">No encontramos productos.</p>
            <p className="mt-2 text-sm text-[#77716a]">
              Probá con otra búsqueda o categoría.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 border border-[#211f1c] px-5 py-3 text-xs tracking-wider"
            >
              VER TODOS LOS PRODUCTOS
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
