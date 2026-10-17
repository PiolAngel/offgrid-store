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
  title: "OFFGRID — Streetwear, básicos premium y sneakers",
  description:
    "Tienda multimarca de ropa urbana, básicos premium y sneakers para Paraguay. Catálogo de demostración.",
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