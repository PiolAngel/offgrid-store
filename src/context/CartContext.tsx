
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";

export const MAX_QUANTITY = 10;

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  addItem: (product: Product, size?: string, color?: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback(
    (product: Product, size = "Único", color = "Único") => {
      const itemId = `${product.id}::${size}::${color}`;

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === itemId,
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    MAX_QUANTITY,
                  ),
                }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            id: itemId,
            product,
            quantity: 1,
            size,
            color,
          },
        ];
      });

      setIsCartOpen(true);
    },
    [],
  );

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== itemId),
        );
        return;
      }

      const safeQuantity = Math.min(
        Math.floor(quantity),
        MAX_QUANTITY,
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: safeQuantity }
            : item,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
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
