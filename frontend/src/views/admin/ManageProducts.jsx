import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  fetchCategoriesApi,
  updateAdminProduct,
} from "../../services/adminProduct.service";
import { formatCurrency } from "../../services/product.service";
import "./ManageProducts.css";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  oldPrice: "",
  rating: "0",
  sold: "0",
  stock: "0",
  badge: "",
  image: "",
  description: "",
  categoryId: "",
  active: true,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ManageProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [productResult, categoryResult] = await Promise.all([
        fetchAdminProducts(token, { search: "", sort: "newest", page: 1, limit: 100 }),
        fetchCategoriesApi(token),
      ]);

      setProducts(productResult?.data || []);
      setCategories(categoryResult?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(String(item.id), item.name));
    return map;
  }, [categories]);

  const categoryOptions = useMemo(
    () => [{ value: "ALL", label: "Tất cả" }, ...categories.map((item) => ({ value: String(item.id), label: item.name }))],
    [categories]
  );

  const categoryFormOptions = useMemo(
    () => [{ value: "", label: "Chọn danh mục" }, ...categories.map((item) => ({ value: String(item.id), label: item.name }))],
    [categories]
  );

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "price-asc", label: "Giá tăng dần" },
    { value: "price-desc", label: "Giá giảm dần" },
    { value: "rating", label: "Đánh giá cao" },
    { value: "best-seller", label: "Bán chạy" },
  ];

  const activeOptions = [
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Tắt" },
  ];

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchesKeyword =
        !keyword ||
        (item.name || "").toLowerCase().includes(keyword) ||
        (item.slug || "").toLowerCase().includes(keyword);
      const matchesCategory =
        categoryFilter === "ALL" || String(item.categoryId) === String(categoryFilter);
      return matchesKeyword && matchesCategory;
    });
  }, [query, categoryFilter, products]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      price: String(item.price ?? ""),
      oldPrice: String(item.oldPrice ?? ""),
      rating: String(item.rating ?? 0),
      sold: String(item.sold ?? 0),
      stock: String(item.stock ?? 0),
      badge: item.badge || "",
      image: item.image || "",
      description: item.description || "",
      categoryId: String(item.categoryId || ""),
      active: item.active ?? true,
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        slug: form.slug?.trim() ? form.slug.trim() : slugify(form.name),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        rating: Number(form.rating),
        sold: Number(form.sold),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        active: Boolean(form.active),
        images: form.image ? [form.image.trim()] : [],
      };

      if (editingId) {
        await updateAdminProduct(token, editingId, payload);
      } else {
        await createAdminProduct(token, payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    setSaving(true);
    setError("");
    try {
      await deleteAdminProduct(token, id);
      if (editingId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manage-products-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý sản phẩm</p>
              <h1 className="page-title">Danh sách sản phẩm</h1>
              <p className="page-description">Quản lý sản phẩm từ dữ liệu backend thật.</p>
            </div>
            <button className="page-action-btn" type="button" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Đóng" : "Thêm sản phẩm"}
            </button>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm kiếm</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên hoặc slug"
              />
            </div>
            <div className="filter-field">
              <label>Danh mục</label>
              <CustomSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
                searchable
              />
            </div>
            <div className="filter-field">
              <label>Sắp xếp</label>
              <CustomSelect
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={sortOptions}
              />
            </div>
          </section>

          {showForm && (
            <section className="manage-products-filters" style={{ marginBottom: 24 }}>
              <form onSubmit={handleSubmit} style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
                <div className="manage-products-filters">
                  <div className="filter-field">
                    <label>Tên</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Slug</label>
                    <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Giá</label>
                    <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
                <div className="manage-products-filters">
                  <div className="filter-field">
                    <label>Giá cũ</label>
                    <input type="number" value={form.oldPrice} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Kho</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Đã bán</label>
                    <input type="number" value={form.sold} onChange={(e) => setForm((p) => ({ ...p, sold: e.target.value }))} />
                  </div>
                </div>
                <div className="manage-products-filters">
                  <div className="filter-field">
                    <label>Đánh giá</label>
                    <input type="number" step="0.1" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Badge</label>
                    <input value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Danh mục</label>
                    <CustomSelect
                      value={form.categoryId}
                      onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                      options={categoryFormOptions}
                      searchable
                    />
                  </div>
                </div>
                <div className="filter-field">
                  <label>Ảnh</label>
                  <input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
                </div>
                <div className="filter-field">
                  <label>Mô tả</label>
                  <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="filter-field">
                  <label>Trạng thái</label>
                  <CustomSelect
                    value={String(form.active)}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === "true" }))}
                    options={activeOptions}
                  />
                </div>
                <div className="row-actions">
                  <button className="page-action-btn" type="submit" disabled={saving}>
                    {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Lưu sản phẩm"}
                  </button>
                  <button className="action-btn delete" type="button" onClick={resetForm} disabled={saving}>
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="manage-products-table">
            <div className="table-head">
              <span>ID</span>
              <span>Sản phẩm</span>
              <span>Danh mục</span>
              <span>Giá</span>
              <span>Kho</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải sản phẩm...</div>
            ) : filteredProducts.length > 0 ? (
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
                  <span>{product.categoryName || categoryNameById.get(String(product.categoryId)) || "-"}</span>
                  <span>{formatCurrency(product.price)}</span>
                  <span>{product.stock}</span>
                  <span className={`status-pill ${product.stock > 20 ? "in-stock" : product.stock > 5 ? "low-stock" : "out-of-stock"}`}>
                    {product.stock > 20 ? "Còn hàng" : product.stock > 5 ? "Còn ít" : "Hết hàng"}
                  </span>
                  <span className="row-actions">
                    <button
                      className="action-btn details"
                      type="button"
                      onClick={() => navigate(`/manage-products/${product.id}`)}
                    >
                      Chi tiết
                    </button>
                    <button className="action-btn edit" type="button" onClick={() => startEdit(product)} disabled={saving}>
                      Sửa
                    </button>
                    <button className="action-btn delete" type="button" onClick={() => handleDelete(product.id)} disabled={saving}>
                      Xóa
                    </button>
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
