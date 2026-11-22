export const FREE_SHIPPING_THRESHOLD = 500000;
export const DELIVERY_COST = 15000;

export function formatPrice(price: number): string {
  return `Gs. ${price.toLocaleString("es-PY")}`;
}

export function hasFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

export function getDeliveryCost(
  subtotal: number,
  method: "delivery" | "pickup",
): number {
  if (method === "pickup" || hasFreeShipping(subtotal)) return 0;
  return DELIVERY_COST;
}