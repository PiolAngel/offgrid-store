import type { Product } from "@/types";

/**
 * La imagen del carrito pertenece al color elegido, no al producto base.
 * Si una variante no tiene foto, se muestra el marcador del carrito;
 * nunca se sustituye por una foto de un color diferente.
 */
export function getCartVariantImage(
  product: Pick<Product, "image" | "variants">,
  color: string,
): string | undefined {
  const variant = product.variants?.find((entry) => entry.color === color);
  if (variant) return variant.image || variant.gallery?.[0] || undefined;
  return product.image;
}
