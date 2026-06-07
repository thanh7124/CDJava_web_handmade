import React, { useMemo, useState } from 'react';
import { filterProducts, formatCurrency, getProductCategories } from '../../services/product.service';
import Sidebar from '../../components/layout/Sidebar';
import './ManageProducts.css';

export default function ManageProducts() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sort, setSort] = useState('default');

  const categories = useMemo(() => getProductCategories(), []);
  const filteredProducts = useMemo(
    () => filterProducts({ keyword, category, sort }),
    [keyword, category, sort]
  );

  return (
    <div className="manage-products-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý sản phẩm</p>
              <h1 className="page-title">Danh sách sản phẩm</h1>
              <p className="page-description">
                Xem, tìm kiếm và chỉnh sửa sản phẩm trong cửa hàng handmade.
              </p>
            </div>
            <button className="page-action-btn">Thêm sản phẩm mới</button>
          </header>

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm sản phẩm</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập tên hoặc danh mục"
              />
            </div>
            <div className="filter-field">
              <label>Danh mục</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label>Sắp xếp</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="best-seller">Bán chạy</option>
                <option value="rating">Đánh giá cao</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </section>

          <section className="manage-products-table">
            <div className="table-head">
              <span>ID</span>
              <span>Sản phẩm</span>
              <span>Danh mục</span>
              <span>Giá</span>
              <span>Kho</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className="table-row" key={product.id}>
                  <span>{product.id}</span>
                  <span className="product-cell">
                    <img src={product.image} alt={product.name} />
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.badge}</small>
                    </div>
                  </span>
                  <span>{product.category}</span>
                  <span>{formatCurrency(product.price)}</span>
                  <span>{product.stock}</span>
                  <span className={`status-pill ${product.stock > 20 ? 'in-stock' : product.stock > 5 ? 'low-stock' : 'out-of-stock'}`}>
                    {product.stock > 20 ? 'Còn hàng' : product.stock > 5 ? 'Còn ít' : 'Hết hàng'}
                  </span>
                  <span className="row-actions">
                    <button className="action-btn edit">Sửa</button>
                    <button className="action-btn delete">Xóa</button>
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">Không tìm thấy sản phẩm nào.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
