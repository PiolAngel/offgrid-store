"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as fallbackProducts } from "@/data/products";
import type { Order, Product } from "@/types";

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  getProduct: (id: string) => Product | undefined;
  isProductActive: (id: string) => boolean;
  createOrder: (order: Omit<Order, "id" | "code" | "createdAt"> & { requestId: string }) => Promise<Order>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [activeIds, setActiveIds] = useState<string[]>(fallbackProducts.map((p) => p.id));

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setActiveIds(data.products.map((p: Product) => p.id));
      }
    } catch {
      // Se muestra el catálogo de demostración hasta restablecer conexión.
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const createOrder = useCallback(async (order: Omit<Order, "id" | "code" | "createdAt">): Promise<Order> => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: order.requestId,
        customer: order.customer,
        items: order.items,
        deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.order) throw new Error(payload.error || "No se pudo registrar el pedido");
    await refresh();
    return payload.order as Order;
  }, [refresh]);

  const getProduct = useCallback((id: string) => products.find((product) => product.id === id), [products]);
  const isProductActive = useCallback((id: string) => activeIds.includes(id), [activeIds]);
  const value = useMemo(() => ({ products, orders: [], getProduct, isProductActive, createOrder, refresh }),
    [products, getProduct, isProductActive, createOrder, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore debe usarse dentro de StoreProvider");
  return store;
}
