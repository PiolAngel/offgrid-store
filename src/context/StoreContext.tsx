"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as baseProducts } from "@/data/products";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Order, Product } from "@/types";

const STORE_STORAGE_KEY = "offgrid:store:v1";

interface StoreData {
  priceOverrides: Record<string, number>;
  stockOverrides: Record<string, Record<string, Record<string, number>>>;
  inactiveProducts: string[];
  orders: Order[];
  nextOrderNumber: number;
}

const INITIAL_DATA: StoreData = {
  priceOverrides: {},
  stockOverrides: {},
  inactiveProducts: [],
  orders: [],
  nextOrderNumber: 1,
};

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  getProduct: (id: string) => Product | undefined;
  isProductActive: (id: string) => boolean;
  createOrder: (order: Omit<Order, "id" | "code" | "createdAt">) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updatePaymentStatus: (orderId: string, status: Order["paymentStatus"]) => void;
  updateProductPrice: (productId: string, price: number) => void;
  updateVariantStock: (productId: string, color: string, size: string, stock: number) => void;
  setProductActive: (productId: string, active: boolean) => void;
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(INITIAL_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readJSON<StoreData>(STORE_STORAGE_KEY);
    if (stored) setData({ ...INITIAL_DATA, ...stored });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeJSON(STORE_STORAGE_KEY, data);
  }, [data, ready]);

  const productsWithOverrides = useMemo(
    () =>
      baseProducts.map((product) => {
        const stockByColor = data.stockOverrides[product.id] ?? {};

        return {
          ...product,
          price: data.priceOverrides[product.id] ?? product.price,
          variants: product.variants?.map((variant) => ({
            ...variant,
            stock: {
              ...variant.stock,
              ...(stockByColor[variant.color] ?? {}),
            },
          })),
        };
      }),
    [data.priceOverrides, data.stockOverrides],
  );

  const getProduct = useCallback(
    (id: string) => productsWithOverrides.find((product) => product.id === id),
    [productsWithOverrides],
  );

  const isProductActive = useCallback(
    (id: string) => !data.inactiveProducts.includes(id),
    [data.inactiveProducts],
  );

  const createOrder = useCallback(
    (orderData: Omit<Order, "id" | "code" | "createdAt">) => {
      const orderNumber = data.nextOrderNumber;
      const order: Order = {
        ...orderData,
        id: `order-${orderNumber}`,
        code: `OFF-${String(orderNumber).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
      };

      setData((current) => {
        const nextStock = { ...current.stockOverrides };

        for (const item of order.items) {
          const product = baseProducts.find((entry) => entry.id === item.productId);
          if (!product) continue;

          const originalVariant = product.variants?.find(
            (variant) => variant.color === item.color,
          );
          const originalStock = originalVariant?.stock?.[item.size] ?? 0;
          const currentStock =
            nextStock[item.productId]?.[item.color]?.[item.size] ?? originalStock;

          nextStock[item.productId] = {
            ...nextStock[item.productId],
            [item.color]: {
              ...nextStock[item.productId]?.[item.color],
              [item.size]: Math.max(0, currentStock - item.quantity),
            },
          };
        }

        return {
          ...current,
          stockOverrides: nextStock,
          orders: [order, ...current.orders],
          nextOrderNumber: orderNumber + 1,
        };
      });

      return order;
    },
    [data.nextOrderNumber],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      setData((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      }));
    },
    [],
  );

  const updatePaymentStatus = useCallback(
    (orderId: string, paymentStatus: Order["paymentStatus"]) => {
      setData((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === orderId ? { ...order, paymentStatus } : order,
        ),
      }));
    },
    [],
  );

  const updateProductPrice = useCallback(
    (productId: string, price: number) => {
      if (!Number.isFinite(price) || price < 0) return;

      setData((current) => ({
        ...current,
        priceOverrides: { ...current.priceOverrides, [productId]: price },
      }));
    },
    [],
  );

  const updateVariantStock = useCallback(
    (productId: string, color: string, size: string, stock: number) => {
      if (!Number.isFinite(stock) || stock < 0) return;

      setData((current) => ({
        ...current,
        stockOverrides: {
          ...current.stockOverrides,
          [productId]: {
            ...current.stockOverrides[productId],
            [color]: {
              ...current.stockOverrides[productId]?.[color],
              [size]: Math.floor(stock),
            },
          },
        },
      }));
    },
    [],
  );

  const setProductActive = useCallback((productId: string, active: boolean) => {
    setData((current) => ({
      ...current,
      inactiveProducts: active
        ? current.inactiveProducts.filter((id) => id !== productId)
        : current.inactiveProducts.includes(productId)
          ? current.inactiveProducts
          : [...current.inactiveProducts, productId],
    }));
  }, []);

  const resetStore = useCallback(() => setData(INITIAL_DATA), []);

  const value = useMemo(
    () => ({
      products: productsWithOverrides,
      orders: data.orders,
      getProduct,
      isProductActive,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      updateProductPrice,
      updateVariantStock,
      setProductActive,
      resetStore,
    }),
    [
      productsWithOverrides,
      data.orders,
      getProduct,
      isProductActive,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      updateProductPrice,
      updateVariantStock,
      setProductActive,
      resetStore,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");

  return context;
}