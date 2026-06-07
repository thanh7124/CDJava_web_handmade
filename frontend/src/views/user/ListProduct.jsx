import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/product/ProductCard";
import "./ListProduct.css";
import {
  fetchProductPage,
  fetchCategories,
} from "../../services/product.service";

function ListProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);

      const result = await fetchProductPage({
        search,
        categoryId,
        sort,
        page,
        limit,
      });

      setProducts(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, categoryId, sort, page]);

  return (
    <div className="home-page">
      <Header />

      <main className="product-page">
        <section className="product-section">
          <div className="product-section-top">
            <div className="section-heading">
              <p>Sản phẩm</p>
              <h2>Danh sách sản phẩm handmade</h2>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm sản phẩm..."
              style={{
                height: 42,
                minWidth: 260,
                borderRadius: 999,
                border: "1px solid #ead7c7",
                padding: "0 16px",
              }}
            />

            <select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              style={{
                height: 42,
                borderRadius: 999,
                border: "1px solid #ead7c7",
                padding: "0 16px",
              }}
            >
              <option value="">Tất cả danh mục</option>

              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              style={{
                height: 42,
                borderRadius: 999,
                border: "1px solid #ead7c7",
                padding: "0 16px",
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="best-seller">Bán chạy</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>

          {loading ? (
            <p style={{ marginTop: 32 }}>Đang tải sản phẩm...</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  product={{
                    ...product,
                    category: product.categoryName,
                  }}
                  key={product.id}
                />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <p style={{ marginTop: 32 }}>Chưa có sản phẩm nào.</p>
          )}

          {totalPages > 1 && (
  <div className="pagination">
    <button
      type="button"
      className="pagination-btn"
      disabled={page <= 1}
      onClick={() => setPage(page - 1)}
    >
      ‹
    </button>

    <div className="pagination-pages">
      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;

        return (
          <button
            type="button"
            key={pageNumber}
            className={`pagination-page ${page === pageNumber ? "active" : ""}`}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>

    <button
      type="button"
      className="pagination-btn"
      disabled={page >= totalPages}
      onClick={() => setPage(page + 1)}
    >
      ›
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