import type { CartItem, Order } from "@/types";
import { formatPrice } from "@/lib/pricing";

const WHATSAPP_NUMBER = "595981951940";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildProductInquiryMessage(product: {
  name: string;
  price: number;
  color?: string;
  size?: string;
}): string {
  return [
    "Hola OFFGRID, quiero consultar por este producto:",
    `Producto: ${product.name}`,
    `Precio: ${formatPrice(product.price)}`,
    product.color ? `Color: ${product.color}` : "",
    product.size ? `Talle: ${product.size}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCartMessage(
  items: CartItem[],
  subtotal: number,
  deliveryCost: number,
): string {
  const lines = items.map(
    (item) =>
      `• ${item.product.name} — ${item.color}, talle ${item.size} x${item.quantity}: ${formatPrice(item.product.price * item.quantity)}`,
  );

  return [
    "Hola OFFGRID, quiero realizar este pedido:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Delivery: ${deliveryCost === 0 ? "GRATIS" : formatPrice(deliveryCost)}`,
    `Total: ${formatPrice(subtotal + deliveryCost)}`,
  ].join("\n");
}

export function buildCustomerStatusMessage(order: Order): string {
  return [
    `Hola ${order.customer.name}, te escribimos de OFFGRID.`,
    `Tu pedido ${order.code} está ahora: ${order.status}.`,
    "Gracias por comprar con nosotros.",
  ].join("\n");
}