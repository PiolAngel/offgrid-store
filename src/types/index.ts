
export type CategoryId =
  | "sneakers"
  | "remeras"
  | "pantalones"
  | "hoodies"
  | "accesorios";

export type ProductTag = "NUEVO" | "SALE";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface ProductVariant {
  color: string;
  colorValue: string;
  image?: string;
  gallery?: string[];
  sizes?: string[];
  stock?: Record<string, number>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  compareAtPrice?: number;
  tag?: ProductTag;
  featured: boolean;
  description: string;
  image?: string;
  gallery?: string[];
  variants?: ProductVariant[];
  tone: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type DeliveryMethod = "delivery" | "pickup";

export type PaymentMethod = "transfer" | "cash";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image?: string;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
}
