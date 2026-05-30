import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  getAllProducts,
} from "../../services/product.service";

import "./Home.css";

function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const navigate = useNavigate();

  // Tự động cuộn đến phần kết quả tìm kiếm khi có từ khóa
  useEffect(() => {
    if (searchQuery) {
      setTimeout(() => {
        const element = document.getElementById("search-results");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [searchQuery]);

  const featuredProducts = getFeaturedProducts() || [];
  const bestSellerProducts = getBestSellerProducts() || [];
  const newArrivalProducts = getNewArrivalProducts() || [];
  const allProducts = getAllProducts() || [];

  const searchResults = searchQuery
    ? allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="home-page">
      <Header />

      <main>
        <HeroSection />

        {searchQuery ? (
          <div style={{ minHeight: "50vh", padding: "60px 0" }} id="search-results">
            {searchResults.length > 0 ? (
              <ProductSection
                label="Kết quả tìm kiếm"
                title={`Tìm thấy ${searchResults.length} sản phẩm cho "${searchQuery}"`}
                products={searchResults}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                maxWidth: '500px', 
                margin: '0 auto', 
                padding: '48px 32px',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 12px 32px rgba(78, 48, 30, 0.05)',
                border: '1px solid #ead7c7'
              }}>
                <div style={{ fontSize: '56px', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ fontSize: '22px', color: '#2f241d', margin: '0 0 12px', fontWeight: 700 }}>
                  Không tìm thấy sản phẩm
                </h3>
                <p style={{ color: '#6f5b4e', fontSize: '15px', margin: '0 0 28px', lineHeight: 1.6 }}>
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa "<strong>{searchQuery}</strong>". Bạn hãy thử tìm kiếm với từ khóa khác nhé!
                </p>
                <button 
                  onClick={() => navigate("/")}
                  style={{
                    background: '#a75f37',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '12px 32px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(167, 95, 55, 0.2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#7f4324'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#a75f37'}
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;