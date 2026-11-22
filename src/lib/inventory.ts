import type { Product, ProductVariant } from "@/types";

export const MAX_QUANTITY = 10;
export const LOW_STOCK_THRESHOLD = 10;

export function getVariantStock(
  product: Product,
  size = "Único",
  color = "Único",
): number {
  const variant = product.variants?.find((item) => item.color === color);

  if (!variant) return 0;

  return variant.stock?.[size] ?? 0;
}

export function getMaxQuantity(
  product: Product,
  size = "Único",
  color = "Único",
): number {
  return Math.min(MAX_QUANTITY, getVariantStock(product, size, color));
}

export function getVariantImage(
  product: Product,
  color = "Único",
): string | undefined {
  return product.variants?.find((item) => item.color === color)?.image;
}

export function isProductSoldOut(product: Product): boolean {
  if (!product.variants?.length) return true;

  return product.variants.every((variant: ProductVariant) =>
    Object.values(variant.stock ?? {}).every((stock) => stock <= 0),
  );
}