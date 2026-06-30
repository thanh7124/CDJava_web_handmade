import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminProduct,
  fetchCategoriesApi,
  updateAdminProduct,
  uploadProductImage,
} from "../../services/adminProduct.service";
import {
  formatCurrency,
  getProductImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from "../../services/product.service";
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

const show = (value) => value || "Chưa cập nhật";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [detail, setDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: String(item.id), label: item.name })),
    [categories]
  );

  const activeOptions = [
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Tắt" },
  ];

  const syncForm = (product) => {
    const image = product?.image || product?.images?.[0] || "";

    setForm({
      name: product?.name || "",
      slug: product?.slug || "",
      price: String(product?.price ?? ""),
      oldPrice: String(product?.oldPrice ?? ""),
      rating: String(product?.rating ?? 0),
      sold: String(product?.sold ?? 0),
      stock: String(product?.stock ?? 0),
      badge: product?.badge || "",
      image,
      description: product?.description || "",
      categoryId: String(product?.categoryId || ""),
      active: Boolean(product?.active),
    });

    setImageFile(null);
    setImagePreview(image);
  };

  const loadData = async () => {
    if (!token) return;

    setError("");

    try {
      const [productDetail, categoryResult] = await Promise.all([
        fetchAdminProduct(token, id),
        fetchCategoriesApi(token),
      ]);

      setDetail(productDetail);
      setCategories(categoryResult?.data || []);
      syncForm(productDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được chi tiết sản phẩm");
    }
  };

  useEffect(() => {
    loadData();
  }, [id, token]);

  const handleChange = (field) => (event) => {
    const value = field === "active" ? event.target.value === "true" : event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(form.image || "");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUrlChange = (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      image: value,
    }));

    setImageFile(null);
    setImagePreview(value);
  };

  const handleStartEdit = () => {
    syncForm(detail);
    setEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    syncForm(detail);
    setEditing(false);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let imageUrl = form.image?.trim() || "";

      if (imageFile) {
        imageUrl = await uploadProductImage(token, imageFile);
      }

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
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };

      const updated = await updateAdminProduct(token, id, payload);

      setDetail(updated);
      syncForm(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const createdDate = detail?.createdDate
    ? new Date(detail.createdDate).toLocaleString("vi-VN")
    : "Chưa có";

  const updatedDate = detail?.updatedDate
    ? new Date(detail.updatedDate).toLocaleString("vi-VN")
    : "Chưa có";

  const currentImage = detail?.image || detail?.images?.[0];

  return (
    <div className="manage-products-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <button
            className="user-detail-back"
            type="button"
            onClick={() => navigate("/manage-products")}
          >
            ← Quay lại danh sách
          </button>

          <header className="page-header">
            <div>
              <p className="page-label">Quản lý sản phẩm</p>
              <h1 className="page-title">Chi tiết sản phẩm</h1>
            </div>

            {detail && !editing ? (
              <button className="page-action-btn" type="button" onClick={handleStartEdit}>
                Chỉnh sửa
              </button>
            ) : null}
          </header>

          {error && <div className="auth-error">{error}</div>}

          {!error && !detail && (
            <div className="empty-state">Đang tải chi tiết sản phẩm...</div>
          )}

          {detail ? (
            <article className="product-detail-card">
              <div className="product-detail-hero">
                <div className="product-detail-image-wrap">
                  <img
                    className="product-detail-image"
                    src={getProductImageUrl(currentImage)}
                    alt={detail.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>

                <div className="product-detail-summary">
                  <p className="page-label">Sản phẩm #{detail.id}</p>
                  <h2>{show(detail.name)}</h2>
                  <p className="product-detail-description">{show(detail.description)}</p>

                  <div className="product-detail-price-row">
                    <strong>
                      {detail.price != null ? formatCurrency(detail.price) : "Chưa cập nhật"}
                    </strong>

                    {detail.oldPrice ? <span>{formatCurrency(detail.oldPrice)}</span> : null}
                  </div>

                  <div className="product-detail-meta-chips">
                    <span
                      className={`status-pill ${
                        detail.stock > 20
                          ? "in-stock"
                          : detail.stock > 5
                          ? "low-stock"
                          : "out-of-stock"
                      }`}
                    >
                      {detail.active ? "Hoạt động" : "Tắt"}
                    </span>

                    <span className="product-chip">{show(detail.categoryName)}</span>
                    <span className="product-chip">Kho: {detail.stock ?? 0}</span>
                  </div>
                </div>
              </div>

              {editing ? (
                <form className="product-detail-grid" onSubmit={handleSave}>
                  <div className="filter-field">
                    <label>Tên</label>
                    <input value={form.name} onChange={handleChange("name")} />
                  </div>

                  <div className="filter-field">
                    <label>Slug</label>
                    <input value={form.slug} onChange={handleChange("slug")} />
                  </div>

                  <div className="filter-field">
                    <label>Giá</label>
                    <input type="number" value={form.price} onChange={handleChange("price")} />
                  </div>

                  <div className="filter-field">
                    <label>Giá cũ</label>
                    <input type="number" value={form.oldPrice} onChange={handleChange("oldPrice")} />
                  </div>

                  <div className="filter-field">
                    <label>Đánh giá</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.rating}
                      onChange={handleChange("rating")}
                    />
                  </div>

                  <div className="filter-field">
                    <label>Đã bán</label>
                    <input type="number" value={form.sold} onChange={handleChange("sold")} />
                  </div>

                  <div className="filter-field">
                    <label>Kho</label>
                    <input type="number" value={form.stock} onChange={handleChange("stock")} />
                  </div>

                  <div className="filter-field">
                    <label>Badge</label>
                    <input value={form.badge} onChange={handleChange("badge")} />
                  </div>

                  <div className="filter-field">
                    <label>Danh mục</label>
                    <CustomSelect
                      value={form.categoryId}
                      onChange={handleChange("categoryId")}
                      options={categoryOptions}
                      searchable
                    />
                  </div>

                  <div className="filter-field">
                    <label>Trạng thái</label>
                    <CustomSelect
                      value={String(form.active)}
                      onChange={handleChange("active")}
                      options={activeOptions}
                    />
                  </div>

                  <div className="filter-field product-detail-full product-image-field">
                    <label>Ảnh sản phẩm</label>

                    <input type="file" accept="image/*" onChange={handleImageFileChange} />

                    <input
                      value={form.image}
                      onChange={handleImageUrlChange}
                      placeholder="Hoặc dán URL ảnh sản phẩm"
                    />

                    {imagePreview && (
                      <div className="product-image-preview">
                        <img
                          src={getProductImageUrl(imagePreview)}
                          alt="Xem trước sản phẩm"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="filter-field product-detail-full">
                    <label>Mô tả</label>
                    <textarea
                      className="product-detail-textarea"
                      value={form.description}
                      onChange={handleChange("description")}
                      rows={5}
                    />
                  </div>

                  <div className="user-detail-actions">
                    <button className="action-btn edit" type="submit" disabled={saving}>
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>

                    <button
                      className="action-btn delete"
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="product-detail-grid">
                  <div className="product-detail-item">
                    <span>ID</span>
                    <strong>{detail.id}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Slug</span>
                    <strong>{show(detail.slug)}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Danh mục</span>
                    <strong>{show(detail.categoryName)}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Trạng thái</span>
                    <strong>{detail.active ? "Hoạt động" : "Tắt"}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Kho</span>
                    <strong>{detail.stock ?? 0}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Đã bán</span>
                    <strong>{detail.sold ?? 0}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Đánh giá</span>
                    <strong>{detail.rating ?? 0}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Badge</span>
                    <strong>{show(detail.badge)}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Ngày tạo</span>
                    <strong>{createdDate}</strong>
                  </div>

                  <div className="product-detail-item">
                    <span>Cập nhật</span>
                    <strong>{updatedDate}</strong>
                  </div>
                </div>
              )}
            </article>
          ) : null}
        </main>
      </div>
    </div>
  );
}