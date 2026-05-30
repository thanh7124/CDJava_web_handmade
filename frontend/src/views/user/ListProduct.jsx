import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/product/ProductCard";

import {
  filterProducts,
  getAllProducts,
  getProductCategories,
} from "../../services/product.service";

import "./Home.css";
import "./ListProduct.css";

function ListProduct() {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  const categories = getProductCategories();
  const totalProducts = getAllProducts().length;

  const filteredProducts = useMemo(() => {
    return filterProducts({
      keyword,
      category: selectedCategory,
      sort,
    });
  }, [keyword, selectedCategory, sort]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedCategory, sort]);

  const resetFilter = () => {
    setKeyword("");
    setSelectedCategory("Tất cả");
    setSort("default");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <div className="home-page">
      <Header />

      <main className="list-product-page">
        <section className="list-product-hero">
          <div>
            <p>Sản phẩm handmade</p>
            <h1>Khám phá tất cả sản phẩm thủ công</h1>
            <span>
              Tìm kiếm những món đồ handmade độc đáo, phù hợp để sử dụng hằng
              ngày, trang trí hoặc làm quà tặng.
            </span>
          </div>
        </section>

        <section className="product-filter-section">
          <div className="filter-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm sản phẩm theo tên hoặc danh mục..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-select">
              <Filter size={18} />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select">
              <SlidersHorizontal size={18} />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="newest">Mới nhất</option>
                <option value="best-seller">Bán chạy</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

            <button
              type="button"
              className="reset-filter-btn"
              onClick={resetFilter}
            >
              Xóa lọc
            </button>
          </div>
        </section>

        <section className="list-product-content">
          <div className="list-product-top">
            <div>
              <p>Tìm thấy</p>
              <h2>
                {filteredProducts.length} / {totalProducts} sản phẩm
              </h2>
            </div>

            <span>
              Trang {totalPages === 0 ? 0 : currentPage} / {totalPages}
            </span>
          </div>

          {currentProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {currentProducts.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          type="button"
                          key={page}
                          className={
                            currentPage === page
                              ? "pagination-page active"
                              : "pagination-page"
                          }
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-product">
              <h3>Không tìm thấy sản phẩm phù hợp</h3>
              <p>Hãy thử tìm kiếm bằng từ khóa khác hoặc chọn lại danh mục.</p>
              <button type="button" onClick={resetFilter}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ListProduct;