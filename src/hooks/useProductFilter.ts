"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/products";
import type { Product } from "@/types";
import type { CategoryId } from "@/types";

export type PriceRange = "all" | "under-300" | "300-500" | "over-500";

export function useProductFilter(products: Product[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery === "" ||
        product.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedQuery) ||
        product.description
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedQuery);

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-300" && product.price < 300000) ||
        (priceRange === "300-500" &&
          product.price >= 300000 &&
          product.price < 500000) ||
        (priceRange === "over-500" && product.price >= 500000);

      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [products, query, category, priceRange]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setPriceRange("all");
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    priceRange,
    setPriceRange,
    categories,
    filteredProducts,
    resetFilters,
  };
}