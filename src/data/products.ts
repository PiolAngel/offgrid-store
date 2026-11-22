import type { Category, Product } from "@/types";

/*
  Catálogo de demostración con stock simulado y FIJO (no se genera al azar).

  Cómo se lee el stock de cada variante:
  - La clave es el talle, escrito igual que en `sizes`.
  - El valor son las unidades disponibles. 0 significa agotado.

  Variantes marcadas "SIN FOTO PROPIA": todavía no tienen imagen de ese color,
  por lo que el modal muestra la foto del producto. Para agregar la foto real:
  1. Guardá el archivo dentro de public/products/.
  2. Agregá a la variante las líneas `image` y `gallery` con esa ruta.
*/

export const categories: Category[] = [
  { id: "sneakers", label: "Sneakers" },
  { id: "remeras", label: "Remeras" },
  { id: "pantalones", label: "Pantalones" },
  { id: "hoodies", label: "Hoodies" },
  { id: "accesorios", label: "Accesorios" },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "white-sneakers",
    name: "White Sneakers",
    category: "sneakers",
    price: 649000,
    featured: true,
    description: "Sneakers blancas de diseño limpio para todos los días.",
    image: "/products/white-sneakers/SNKRWITH1-wide.webp",
    gallery: [
      "/products/white-sneakers/SNKRWITH1-wide.webp",
      "/products/white-sneakers/SNKRWITH2-wide.webp",
    ],
    variants: [
      {
        color: "Blanco",
        colorValue: "#F5F5F0",
        image: "/products/white-sneakers/SNKRWITH1-wide.webp",
        gallery: [
          "/products/white-sneakers/SNKRWITH1-wide.webp",
          "/products/white-sneakers/SNKRWITH2-wide.webp",
        ],
        sizes: ["38", "39", "40", "41", "42", "43"],
        stock: {
          "38": 0,
          "39": 2,
          "40": 5,
          "41": 12,
          "42": 8,
          "43": 3,
        },
      },
    ],
    tone: "light",
  },
  {
    id: "2",
    slug: "retro-grey-sneakers",
    name: "Retro Grey Sneakers",
    category: "sneakers",
    price: 729000,
    compareAtPrice: 849000,
    tag: "SALE",
    featured: true,
    description: "Inspiración retro, tonos grises y estética urbana.",
    image: "/products/grey-sneakers/SNKRGRAY1-wide.jpg",
    gallery: [
      "/products/grey-sneakers/SNKRGRAY1-wide.jpg",
      "/products/grey-sneakers/SNKRGRAY2-wide.jpg",
    ],
    variants: [
      {
        color: "Gris",
        colorValue: "#A5A5A2",
        image: "/products/grey-sneakers/SNKRGRAY1-wide.jpg",
        gallery: [
          "/products/grey-sneakers/SNKRGRAY1-wide.jpg",
          "/products/grey-sneakers/SNKRGRAY2-wide.jpg",
        ],
        sizes: ["38", "39", "40", "41", "42", "43"],
        stock: {
          "38": 3,
          "39": 6,
          "40": 9,
          "41": 4,
          "42": 1,
          "43": 0,
        },
      },
    ],
    tone: "grey",
  },
  {
    id: "3",
    slug: "black-sneakers",
    name: "Black Sneakers",
    category: "sneakers",
    price: 589000,
    featured: true,
    description: "Sneakers negras versátiles con un estilo minimalista.",
    image: "/products/black-sneakers/SNKRBLCK1-wide.webp",
    gallery: [
      "/products/black-sneakers/SNKRBLCK1-wide.webp",
      "/products/black-sneakers/SNKRBLCK2.avif",
    ],
    variants: [
      {
        color: "Negro",
        colorValue: "#252525",
        image: "/products/black-sneakers/SNKRBLCK1-wide.webp",
        gallery: [
          "/products/black-sneakers/SNKRBLCK1-wide.webp",
          "/products/black-sneakers/SNKRBLCK2.avif",
        ],
        sizes: ["38", "39", "40", "41", "42", "43"],
        stock: {
          "38": 5,
          "39": 8,
          "40": 15,
          "41": 11,
          "42": 7,
          "43": 2,
        },
      },
    ],
    tone: "dark",
  },
  {
    id: "4",
    slug: "beige-sneakers",
    name: "Beige Sneakers",
    category: "sneakers",
    price: 799000,
    tag: "NUEVO",
    featured: true,
    description: "Un tono neutro premium que combina con todo.",
    image: "/products/beige-sneakers/SNKRBEIG1.webp",
    gallery: [
      "/products/beige-sneakers/SNKRBEIG1.webp",
      "/products/beige-sneakers/SNKRBEIG2.webp",
    ],
    variants: [
      {
        color: "Beige",
        colorValue: "#D8CBB7",
        image: "/products/beige-sneakers/SNKRBEIG1.webp",
        gallery: [
          "/products/beige-sneakers/SNKRBEIG1.webp",
          "/products/beige-sneakers/SNKRBEIG2.webp",
        ],
        sizes: ["38", "39", "40", "41", "42", "43"],
        stock: {
          "38": 0,
          "39": 1,
          "40": 3,
          "41": 6,
          "42": 4,
          "43": 0,
        },
      },
    ],
    tone: "sand",
  },
  {
    id: "5",
    slug: "essential-tee",
    name: "Essential Tee",
    category: "remeras",
    price: 189000,
    featured: true,
    description: "Remera esencial de corte cómodo y estilo atemporal.",
    image: "/products/tees/essential-tee.png",
    gallery: [
      "/products/tees/essential-tee.png",
      "/products/tees/essential-tee-2.png",
    ],
    variants: [
      {
        color: "Crema",
        colorValue: "#E8DFD0",
        image: "/products/tees/essential-tee.png",
        gallery: [
          "/products/tees/essential-tee.png",
          "/products/tees/essential-tee-2.png",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 6,
          M: 12,
          L: 9,
          XL: 3,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Negro",
        colorValue: "#252525",
        image: "/products/tees/essential-tee-black-1.webp",
        gallery: [
          "/products/tees/essential-tee-black-1.webp",
          "/products/tees/essential-tee-black-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 4,
          M: 0,
          L: 7,
          XL: 2,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Gris",
        colorValue: "#A5A5A2",
        image: "/products/tees/essential-tee-grey-1.webp",
        gallery: [
          "/products/tees/essential-tee-grey-1.webp",
          "/products/tees/essential-tee-grey-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 1,
          M: 5,
          L: 10,
          XL: 0,
        },
      },
    ],
    tone: "light",
  },
  {
    id: "6",
    slug: "boxy-tee-black",
    name: "Boxy Tee Black",
    category: "remeras",
    price: 219000,
    tag: "NUEVO",
    featured: true,
    description: "Remera negra de corte boxy para un look relajado.",
    image: "/products/tees/boxy-tee-black.webp",
    gallery: [
      "/products/tees/boxy-tee-black.webp",
      "/products/tees/boxy-tee-black-2.webp",
    ],
    variants: [
      {
        color: "Negro",
        colorValue: "#252525",
        image: "/products/tees/boxy-tee-black.webp",
        gallery: [
          "/products/tees/boxy-tee-black.webp",
          "/products/tees/boxy-tee-black-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 2,
          M: 5,
          L: 8,
          XL: 1,
        },
      },
    ],
    tone: "dark",
  },
  {
    id: "7",
    slug: "heavy-tee-grey",
    name: "Heavy Tee Grey",
    category: "remeras",
    price: 229000,
    compareAtPrice: 259000,
    tag: "SALE",
    featured: false,
    description: "Remera gris de apariencia robusta y estilo urbano.",
    image: "/products/tees/heavy-tee-grey.webp",
    gallery: [
      "/products/tees/heavy-tee-grey.webp",
      "/products/tees/heavy-tee-grey-2.webp",
    ],
    variants: [
      {
        // Producto agotado a propósito (todos los talles en 0).
        color: "Gris",
        colorValue: "#A5A5A2",
        image: "/products/tees/heavy-tee-grey.webp",
        gallery: [
          "/products/tees/heavy-tee-grey.webp",
          "/products/tees/heavy-tee-grey-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
        },
      },
    ],
    tone: "grey",
  },
  {
    id: "8",
    slug: "denim-straight",
    name: "Denim Straight",
    category: "pantalones",
    price: 379000,
    featured: true,
    description: "Denim de corte recto con una silueta clásica.",
    image: "/products/denim/denim-straight.webp",
    gallery: [
      "/products/denim/denim-straight.webp",
      "/products/denim/denim-straight-2.webp",
    ],
    variants: [
      {
        color: "Azul",
        colorValue: "#536779",
        image: "/products/denim/denim-straight.webp",
        gallery: [
          "/products/denim/denim-straight.webp",
          "/products/denim/denim-straight-2.webp",
        ],
        sizes: ["28", "30", "32", "34", "36"],
        stock: {
          "28": 2,
          "30": 7,
          "32": 10,
          "34": 5,
          "36": 1,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Negro",
        colorValue: "#2B2B2B",
        image: "/products/denim/denim-black-1.webp",
        gallery: [
          "/products/denim/denim-black-1.webp",
          "/products/denim/denim-black-2.webp",
        ],
        sizes: ["28", "30", "32", "34", "36"],
        stock: {
          "28": 0,
          "30": 3,
          "32": 6,
          "34": 4,
          "36": 2,
        },
      },
    ],
    tone: "blue",
  },
  {
    id: "9",
    slug: "cargo-relaxed",
    name: "Cargo Relaxed",
    category: "pantalones",
    price: 429000,
    featured: false,
    description: "Pantalón cargo relajado con inspiración utilitaria.",
    image: "/products/cargo/cargo-relaxed.jpg",
    gallery: [
      "/products/cargo/cargo-relaxed.jpg",
      "/products/cargo/cargo-relaxed-2.jpeg",
    ],
    variants: [
      {
        color: "Beige",
        colorValue: "#D8CBB7",
        image: "/products/cargo/cargo-relaxed.jpg",
        gallery: [
          "/products/cargo/cargo-relaxed.jpg",
          "/products/cargo/cargo-relaxed-2.jpeg",
        ],
        sizes: ["28", "30", "32", "34", "36"],
        stock: {
          "28": 4,
          "30": 8,
          "32": 12,
          "34": 6,
          "36": 3,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Verde oliva",
        colorValue: "#6B6B4B",
        image: "/products/cargo/cargo-olive-1.webp",
        gallery: [
          "/products/cargo/cargo-olive-1.webp",
          "/products/cargo/cargo-olive-2.webp",
        ],
        sizes: ["28", "30", "32", "34", "36"],
        stock: {
          "28": 0,
          "30": 2,
          "32": 5,
          "34": 3,
          "36": 1,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        // Color agotado a propósito (todos los talles en 0).
        color: "Negro",
        colorValue: "#252525",
        image: "/products/cargo/cargo-black-1.webp",
        gallery: [
          "/products/cargo/cargo-black-1.webp",
          "/products/cargo/cargo-black-2.webp",
        ],
        sizes: ["28", "30", "32", "34", "36"],
        stock: {
          "28": 0,
          "30": 0,
          "32": 0,
          "34": 0,
          "36": 0,
        },
      },
    ],
    tone: "sand",
  },
  {
    id: "10",
    slug: "core-hoodie",
    name: "Core Hoodie",
    category: "hoodies",
    price: 449000,
    featured: true,
    description: "Hoodie esencial para completar cualquier outfit.",
    image: "/products/hoodies/core-hoodie.webp",
    gallery: [
      "/products/hoodies/core-hoodie.webp",
      "/products/hoodies/core-hoodie-2.webp",
    ],
    variants: [
      {
        color: "Gris",
        colorValue: "#A5A5A2",
        image: "/products/hoodies/core-hoodie.webp",
        gallery: [
          "/products/hoodies/core-hoodie.webp",
          "/products/hoodies/core-hoodie-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 5,
          M: 9,
          L: 14,
          XL: 6,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Negro",
        colorValue: "#252525",
        image: "/products/hoodies/hoodie-black-1.webp",
        gallery: [
          "/products/hoodies/hoodie-black-1.webp",
          "/products/hoodies/hoodie-black-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 3,
          M: 1,
          L: 0,
          XL: 8,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Azul marino",
        colorValue: "#2F3A4F",
        image: "/products/hoodies/hoodie-navy-1.webp",
        gallery: [
          "/products/hoodies/hoodie-navy-1.webp",
          "/products/hoodies/hoodie-navy-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 0,
          M: 4,
          L: 7,
          XL: 2,
        },
      },
    ],
    tone: "grey",
  },
  {
    id: "11",
    slug: "zip-hoodie-cream",
    name: "Zip Hoodie Cream",
    category: "hoodies",
    price: 499000,
    tag: "NUEVO",
    featured: false,
    description: "Hoodie con cierre frontal en un tono crema suave.",
    image: "/products/hoodies/zip-hoodie-cream.webp",
    gallery: [
      "/products/hoodies/zip-hoodie-cream.webp",
      "/products/hoodies/zip-hoodie-cream-2.webp",
    ],
    variants: [
      {
        color: "Crema",
        colorValue: "#E8DFD0",
        image: "/products/hoodies/zip-hoodie-cream.webp",
        gallery: [
          "/products/hoodies/zip-hoodie-cream.webp",
          "/products/hoodies/zip-hoodie-cream-2.webp",
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          S: 7,
          M: 4,
          L: 2,
          XL: 0,
        },
      },
    ],
    tone: "light",
  },
  {
    id: "12",
    slug: "everyday-cap",
    name: "Everyday Cap",
    category: "accesorios",
    price: 149000,
    featured: false,
    description: "Gorra minimalista para el uso diario.",
    image: "/products/caps/everyday-cap.webp",
    gallery: [
      "/products/caps/everyday-cap.webp",
      "/products/caps/everyday-cap-2.webp",
    ],
    variants: [
      {
        color: "Negro",
        colorValue: "#252525",
        image: "/products/caps/everyday-cap.webp",
        gallery: [
          "/products/caps/everyday-cap.webp",
          "/products/caps/everyday-cap-2.webp",
        ],
        sizes: ["Único"],
        stock: {
          "Único": 15,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Beige",
        colorValue: "#D8CBB7",
        image: "/products/caps/cap-beige-1.webp",
        gallery: [
          "/products/caps/cap-beige-1.webp",
          "/products/caps/cap-beige-2.webp",
        ],
        sizes: ["Único"],
        stock: {
          "Único": 4,
        },
      },
      {
        // SIN FOTO PROPIA: muestra la foto del producto.
        color: "Azul marino",
        colorValue: "#2F3A4F",
        image: "/products/caps/cap-navy-1.webp",
        gallery: [
          "/products/caps/cap-navy-1.webp",
          "/products/caps/cap-navy-2.webp",
        ],
        sizes: ["Único"],
        stock: {
          "Único": 1,
        },
      },
    ],
    tone: "dark",
  },
];

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}