import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import HeroSection from "../../components/home/HeroSection";
import PromoBanner from "../../components/home/PromoBanner";
import TrustSection from "../../components/home/TrustSection";
import CategorySection from "../../components/home/CategorySection";
import ProductSection from "../../components/home/ProductSection";
import ShoppingGuideSection from "../../components/home/ShoppingGuideSection";
import TestimonialSection from "../../components/home/TestimonialSection";
import NewsletterSection from "../../components/home/NewsletterSection";

import {
  getFeaturedProducts,
  getBestSellerProducts,
  getNewArrivalProducts,
} from "../../services/product.service";

import "./Home.css";

function Home() {
  const featuredProducts = getFeaturedProducts() || [];
  const bestSellerProducts = getBestSellerProducts() || [];
  const newArrivalProducts = getNewArrivalProducts() || [];

  return (
    <div className="home-page">
      <Header />

      <main>
        <HeroSection />

        <PromoBanner />

        <TrustSection />

        <CategorySection />

        <ProductSection
          id="products"
          label="Sản phẩm nổi bật"
          title="Những món handmade được yêu thích"
          products={featuredProducts}
        />

        <ProductSection
          label="Bán chạy"
          title="Các sản phẩm được mua nhiều trong tuần"
          products={bestSellerProducts}
        />

        <ProductSection
          label="Mới về"
          title="Những mẫu handmade vừa được cập nhật"
          products={newArrivalProducts}
        />

        <ShoppingGuideSection />

        <TestimonialSection />

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;