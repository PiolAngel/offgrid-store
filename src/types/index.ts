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