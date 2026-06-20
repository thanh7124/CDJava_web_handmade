import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  createCategoryApi,
  deleteCategoryApi,
  fetchAdminCategories,
  updateCategoryApi,
} from "../../services/category.service";
import "./AdminCrud.css";

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

const emptyCreateForm = {
  name: "",
  description: "",
};

export default function ManageCategories() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editForm, setEditForm] = useState(emptyCreateForm);

  const loadCategories = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminCategories(token);
      setCategories(result?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const filteredCategories = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return categories.filter((category) => {
      const name = category.name || "";
      const slug = category.slug || "";

      return (
        name.toLowerCase().includes(lowerQuery) ||
        slug.toLowerCase().includes(lowerQuery)
      );
    });
  }, [query, categories]);

  const resetCreateForm = () => {
    setCreateForm(emptyCreateForm);
    setShowCreateForm(false);
    setError("");
  };

  const resetEditForm = () => {
    setEditingCategoryId(null);
    setEditForm(emptyCreateForm);
    setError("");
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const name = createForm.name.trim();
    if (!name) {
      setError("Tên danh mục không được để trống");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createCategoryApi(token, {
        name,
        slug: slugify(name),
        description: createForm.description.trim() || null,
        image: null,
        active: true,
      });

      resetCreateForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được danh mục");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditForm({
      name: category.name || "",
      description: category.description || "",
    });
    setShowCreateForm(false);
    setError("");
  };

  const handleEditSubmit = async (event, categoryId) => {
    event.preventDefault();

    const name = editForm.name.trim();
    if (!name) {
      setError("Tên danh mục không được để trống");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateCategoryApi(token, categoryId, {
        name,
        slug: slugify(name),
        description: editForm.description.trim() || null,
        image: null,
        active: true,
      });

      resetEditForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được danh mục");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteCategoryApi(token, categoryId);
      if (editingCategoryId === categoryId) {
        resetEditForm();
      }
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được danh mục");
    } finally {
      setSaving(false);
    }
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
                Thêm danh mục mới bằng form, hoặc sửa trực tiếp ngay trên từng dòng.
              </p>
            </div>
            <button
              className="page-action-btn"
              type="button"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                resetEditForm();
              }}
            >
              {showCreateForm ? "Đóng" : "Thêm danh mục"}
            </button>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm danh mục</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên hoặc slug danh mục"
              />
            </div>
          </section>

          {showCreateForm && (
            <section className="manage-products-filters" style={{ marginTop: 16 }}>
              <form
                onSubmit={handleCreateSubmit}
                style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}
              >
                <div className="filter-field">
                  <label>Tên danh mục</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div className="filter-field">
                  <label>Mô tả danh mục</label>
                  <input
                    type="text"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Nhập mô tả danh mục"
                  />
                </div>

                <div className="row-actions">
                  <button className="page-action-btn" type="submit" disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu danh mục"}
                  </button>
                  <button
                    className="action-btn edit"
                    type="button"
                    onClick={resetCreateForm}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="manage-products-table category-table">
            <div className="table-head">
              <span>ID</span>
              <span>Danh mục</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải danh mục...</div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
                const isEditing = editingCategoryId === category.id;

                return isEditing ? (
                  <form
                    key={category.id}
                    className="table-row category-inline-edit"
                    onSubmit={(event) => handleEditSubmit(event, category.id)}
                  >
                    <span>{category.id}</span>
                    <span>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Tên danh mục"
                      />
                    </span>
                    <span className={`status-pill ${category.active ? "in-stock" : "out-of-stock"}`}>
                      {category.active ? "Đang hoạt động" : "Đã ẩn"}
                    </span>
                    <span className="row-actions">
                      <button className="action-btn edit" type="submit" disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        className="action-btn delete"
                        type="button"
                        onClick={resetEditForm}
                        disabled={saving}
                      >
                        Hủy
                      </button>
                    </span>
                    <span style={{ gridColumn: "1 / -1" }}>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Mô tả danh mục"
                      />
                    </span>
                  </form>
                ) : (
                  <div className="table-row" key={category.id}>
                    <span>{category.id}</span>
                    <span>{category.name}</span>
                    <span
                      className={`status-pill ${
                        category.active ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {category.active ? "Đang hoạt động" : "Đã ẩn"}
                    </span>
                    <span className="row-actions">
                      <button
                        className="action-btn edit"
                        type="button"
                        onClick={() => handleStartEdit(category)}
                        disabled={saving}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        disabled={saving}
                      >
                        Xóa
                      </button>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">Không có danh mục nào phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
