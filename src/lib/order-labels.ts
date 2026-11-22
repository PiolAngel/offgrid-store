import type { DeliveryMethod, OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  delivery: "Delivery",
  pickup: "Retiro en local",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: "Transferencia",
  cash: "Efectivo",
};