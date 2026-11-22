
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Catalog from "@/components/Catalog";
import EditorialBanner from "@/components/EditorialBanner";
import BrandStory from "@/components/BrandStory";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <FeaturedProducts />
        <Catalog />
        <EditorialBanner />
        <BrandStory />
      </main>
      <CartDrawer />
    </>
  );
}
