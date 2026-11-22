"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import { useEffect } from "react";
import { readJSON, writeJSON } from "@/lib/storage";
import { useStore } from "@/context/StoreContext";

export const MAX_QUANTITY = 10;

/**
 * Stock de una combinación de color y talle.
 * Devuelve undefined si el stock no está definido (en ese caso no hay control de stock).
 * Un stock de 0 significa agotado.
 */
export function getVariantStock(
  product: Product,
  size: string,
  color: string,
): number | undefined {
  const variant = product.variants?.find((item) => item.color === color);
  const value = variant?.stock?.[size];

  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;

  return Math.max(0, Math.floor(value));
}

/** Cantidad máxima que puede tener el carrito de esta combinación: el menor entre el stock y MAX_QUANTITY. */
export function getMaxQuantity(
  product: Product,
  size: string,
  color: string,
): number {
  const stock = getVariantStock(product, size, color);

  return stock === undefined ? MAX_QUANTITY : Math.min(MAX_QUANTITY, stock);
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  /** Devuelve true si se agregó una unidad, o false si no hay stock disponible o se alcanzó el límite. */
  addItem: (product: Product, size?: string, color?: string) => boolean;
  setQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products: currentProducts } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Copia síncrona del carrito. Permite comprobar el stock con los datos más recientes,
  // incluso cuando se llama a addItem varias veces seguidas (por ejemplo, cantidad 3 desde el modal).
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    const saved = readJSON<CartItem[]>("offgrid:cart:v1");
    if (Array.isArray(saved)) {
      const safe = saved.filter((item) => item && item.product && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0).slice(0, 50);
      itemsRef.current = safe;
      setItems(safe);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON("offgrid:cart:v1", items);
  }, [hydrated, items]);

  const commitItems = useCallback((nextItems: CartItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const next = itemsRef.current.flatMap((item) => {
      const current = currentProducts.find((product) => product.id === item.product.id);
      if (!current) return [];
      const max = getMaxQuantity(current, item.size, item.color);
      if (max < 1) return [];
      return [{ ...item, product: current, quantity: Math.min(item.quantity, max) }];
    });
    const changed = next.length !== itemsRef.current.length ||
      next.some((item, index) => item.product !== itemsRef.current[index].product || item.quantity !== itemsRef.current[index].quantity);
    if (changed) commitItems(next);
  }, [currentProducts, hydrated, commitItems]);

  const addItem = useCallback(
    (product: Product, size = "Único", color = "Único"): boolean => {
      const itemId = `${product.id}::${size}::${color}`;
      const maxQuantity = getMaxQuantity(product, size, color);
      const currentItems = itemsRef.current;
      const existingItem = currentItems.find((item) => item.id === itemId);
      const currentQuantity = existingItem?.quantity ?? 0;

      // Sin stock o límite alcanzado: no se agrega nada.
      if (currentQuantity >= maxQuantity) {
        if (existingItem) setIsCartOpen(true);
        return false;
      }

      if (existingItem) {
        commitItems(
          currentItems.map((item) =>
            item.id === itemId
              ? { ...item, quantity: currentQuantity + 1 }
              : item,
          ),
        );
      } else {
        commitItems([
          ...currentItems,
          {
            id: itemId,
            product,
            quantity: 1,
            size,
            color,
          },
        ]);
      }

      setIsCartOpen(true);
      return true;
    },
    [commitItems],
  );

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (!Number.isFinite(quantity)) return;

      const currentItems = itemsRef.current;
      const targetItem = currentItems.find((item) => item.id === itemId);

      if (!targetItem) return;

      const safeQuantity = Math.min(
        Math.floor(quantity),
        getMaxQuantity(targetItem.product, targetItem.size, targetItem.color),
      );

      if (safeQuantity <= 0) {
        commitItems(currentItems.filter((item) => item.id !== itemId));
        return;
      }

      commitItems(
        currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: safeQuantity } : item,
        ),
      );
    },
    [commitItems],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      commitItems(itemsRef.current.filter((item) => item.id !== itemId));
    },
    [commitItems],
  );

  const clearCart = useCallback(() => commitItems([]), [commitItems]);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      isCartOpen,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      isCartOpen,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}