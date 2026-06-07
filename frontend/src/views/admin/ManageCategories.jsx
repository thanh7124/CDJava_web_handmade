import React, { useMemo, useState } from 'react';
import { getAllProducts, getProductCategories } from '../../services/product.service';
import Sidebar from '../../components/layout/Sidebar';
import './AdminCrud.css';

export default function ManageCategories() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState(
    getProductCategories().filter((category) => category !== 'Tất cả')
  );
  const [newCategory, setNewCategory] = useState('');

  const filteredCategories = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return categories.filter((category) =>
      category.toLowerCase().includes(lowerQuery)
    );
  }, [query, categories]);

  const productCounts = useMemo(() => {
    const products = getAllProducts();
    return categories.reduce((acc, category) => {
      acc[category] = products.filter((product) => product.category === category).length;
      return acc;
    }, {});
  }, [categories]);

  const handleAddCategory = () => {
    const newName = newCategory.trim();
    if (!newName || categories.includes(newName)) return;
    setCategories((prev) => [...prev, newName]);
    setNewCategory('');
  };

  const handleRemoveCategory = (categoryToDelete) => {
    setCategories((prev) => prev.filter((category) => category !== categoryToDelete));
  };

  return (
    <div className="admin-page manage-categories-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý danh mục</p>
              <h1 className="page-title">Danh mục sản phẩm</h1>
              <p className="page-description">
                Thêm, tìm kiếm và quản lý các danh mục sản phẩm trong cửa hàng.
              </p>
            </div>
            <button className="page-action-btn" onClick={handleAddCategory}>
              Thêm danh mục
            </button>
          </header>

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm danh mục</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div className="filter-field">
              <label>Danh mục mới</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Tên danh mục"
              />
            </div>
          </section>

          <section className="manage-products-table">
            <div className="table-head">
              <span>#</span>
              <span>Danh mục</span>
              <span>Số sản phẩm</span>
              <span>Hành động</span>
            </div>

            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <div className="table-row" key={category}>
                  <span>{index + 1}</span>
                  <span>{category}</span>
                  <span>{productCounts[category] || 0}</span>
                  <span className="row-actions">
                    <button className="action-btn edit">Sửa</button>
                    <button className="action-btn delete" onClick={() => handleRemoveCategory(category)}>
                      Xóa
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">Không có danh mục nào phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
