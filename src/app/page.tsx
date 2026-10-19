import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Catalog from "@/components/Catalog";
import EditorialBanner from "@/components/EditorialBanner";
import BrandStory from "@/components/BrandStory";
import CartDrawer from "@/components/CartDrawer";
import { products } from "@/data/products";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <FeaturedProducts products={products} />
        <Catalog />
        <EditorialBanner />
        <BrandStory />
      </main>
      <CartDrawer />
    </>
  );
}