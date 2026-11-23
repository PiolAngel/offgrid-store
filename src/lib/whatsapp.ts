import type { CartItem, Order } from "@/types";
import { formatPrice } from "@/lib/pricing";

// Para la BETA no usamos un destinatario real sin autorización.
// Cuando se establezca un teléfono válido, el mismo código podrá abrir el chat directo.
const configuredNumber = process.env.NEXT_PUBLIC_OFFGRID_WHATSAPP?.replace(/\D/g, "");
export const WHATSAPP_NUMBER = configuredNumber && /^5959\d{8}$/.test(configuredNumber)
  ? configuredNumber
  : "";

export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message || "Hola OFFGRID, estoy explorando la demostración de la tienda.");
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;
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