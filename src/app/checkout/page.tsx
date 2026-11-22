import type { Metadata } from "next";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout — OFFGRID",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CheckoutFlow />
      </main>
      <CartDrawer />
    </>
  );
}