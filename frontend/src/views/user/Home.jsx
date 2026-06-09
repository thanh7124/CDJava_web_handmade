import { useEffect, useState } from "react";
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
  fetchProductPage,
  fetchCategories,
} from "../../services/product.service";

import "./Home.css";

function normalizeProducts(result) {
  return result?.data || [];
}

function normalizeCategories(data) {
  if (Array.isArray(data)) return data;
  return data?.data || [];
}

function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHomeData() {
    try {
      setLoading(true);
      setError("");

      const [categoryData, featuredResult, bestSellerResult, newestResult] =
        await Promise.all([
          fetchCategories(),
          fetchProductPage({
            sort: "rating",
            page: 1,
            limit: 8,
          }),
          fetchProductPage({
            sort: "best-seller",
            page: 1,
            limit: 8,
          }),
          fetchProductPage({
            sort: "newest",
            page: 1,
            limit: 8,
          }),
        ]);

      setCategories(normalizeCategories(categoryData));
      setFeaturedProducts(normalizeProducts(featuredResult));
      setBestSellerProducts(normalizeProducts(bestSellerResult));
      setNewArrivalProducts(normalizeProducts(newestResult));
    } catch (error) {
      console.error("Lỗi tải dữ liệu trang chủ:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu trang chủ"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSearchResults() {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);

      const result = await fetchProductPage({
        search: searchQuery,
        page: 1,
        limit: 12,
        sort: "newest",
      });

      setSearchResults(normalizeProducts(result));

      setTimeout(() => {
        const element = document.getElementById("search-results");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Lỗi tìm kiếm sản phẩm:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    loadSearchResults();
  }, [searchQuery]);

  return (
    <div className="home-page">
      <Header />

      <main>
        <HeroSection />

        {searchQuery ? (
          <section className="home-search-section" id="search-results">
            {searchLoading ? (
              <div className="home-state-box">Đang tìm kiếm sản phẩm...</div>
            ) : searchResults.length > 0 ? (
              <ProductSection
                label="Kết quả tìm kiếm"
                title={`Tìm thấy ${searchResults.length} sản phẩm cho "${searchQuery}"`}
                products={searchResults}
                viewTo={`/products?search=${encodeURIComponent(searchQuery)}`}
              />
            ) : (
              <div className="home-empty-box">
                <div className="home-empty-icon">🔍</div>

                <h3>Không tìm thấy sản phẩm</h3>

                <p>
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ
                  khóa <strong>"{searchQuery}"</strong>. Bạn hãy thử tìm kiếm
                  với từ khóa khác nhé!
                </p>

                <button type="button" onClick={() => navigate("/products")}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <PromoBanner />

            <TrustSection />

            {error && <div className="home-api-error">{error}</div>}

            <CategorySection categories={categories} />

            {loading ? (
              <div className="home-state-box">Đang tải sản phẩm...</div>
            ) : (
              <>
                <ProductSection
                  id="products"
                  label="Sản phẩm nổi bật"
                  title="Những món handmade được yêu thích"
                  products={featuredProducts}
                  viewTo="/products?sort=rating"
                />

                <ProductSection
                  label="Bán chạy"
                  title="Các sản phẩm được mua nhiều trong tuần"
                  products={bestSellerProducts}
                  viewTo="/products?sort=best-seller"
                />

                <ProductSection
                  label="Mới về"
                  title="Những mẫu handmade vừa được cập nhật"
                  products={newArrivalProducts}
                  viewTo="/products?sort=newest"
                />
              </>
            )}

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