import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://offgrid-store-rho.vercel.app"),
  title: "OFFGRID — Streetwear, básicos premium y sneakers",
    description:
    "Descubrí OFFGRID: ropa urbana, básicos premium y sneakers seleccionados para todos los días.",
  icons: {
    icon: [
      { url: "/offgrid-tab-icon-v2.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "OFFGRID — Streetwear, básicos premium y sneakers",
    description:
      "Ropa urbana, básicos premium y sneakers. Descubrí OFFGRID.",
    url: "https://offgrid-store-rho.vercel.app",
    siteName: "OFFGRID",
    locale: "es_PY",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        alt: "OFFGRID — Streetwear y básicos premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OFFGRID — Streetwear, básicos premium y sneakers",
    description:
      "Ropa urbana, básicos premium y sneakers. Descubrí OFFGRID.",
    images: ["/og-image.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F0E8",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-sans text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}