import React, { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  createPromotionApi,
  deletePromotionApi,
  fetchAdminPromotions,
  updatePromotionApi,
} from "../../services/promotion.service";
import "./ManagePromotions.css";

const emptyForm = {
  code: "",
  name: "",
  discountType: "PERCENT",
  discountValue: "",
  startDate: "",
  endDate: "",
  description: "",
  active: true,
};

const filterStatusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

const discountTypeOptions = [
  { value: "PERCENT", label: "PERCENT" },
  { value: "AMOUNT", label: "AMOUNT" },
];

const activeOptions = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Tắt" },
];

function toDateTimeLocal(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

function buildPayload(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    description: form.description.trim() || null,
    active: Boolean(form.active),
  };
}

export default function ManagePromotions() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadPromotions = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminPromotions(token);
      setPromotions(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được khuyến mại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, [token]);

  const filteredPromotions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return promotions.filter((item) => {
      const matchesQuery =
        !keyword ||
        (item.code || "").toLowerCase().includes(keyword) ||
        (item.name || "").toLowerCase().includes(keyword);
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" ? item.active : !item.active);
      return matchesQuery && matchesStatus;
    });
  }, [query, filterStatus, promotions]);

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
      code: item.code || "",
      name: item.name || "",
      discountType: item.discountType || "PERCENT",
      discountValue: String(item.discountValue ?? ""),
      startDate: toDateTimeLocal(item.startDate),
      endDate: toDateTimeLocal(item.endDate),
      description: item.description || "",
      active: Boolean(item.active),
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload(form);
      if (editingId) {
        await updatePromotionApi(token, editingId, payload);
      } else {
        await createPromotionApi(token, payload);
      }
      resetForm();
      await loadPromotions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được khuyến mại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khuyến mại này không?")) return;
    setSaving(true);
    setError("");
    try {
      await deletePromotionApi(token, id);
      if (editingId === id) resetForm();
      await loadPromotions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được khuyến mại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promo-page">
      <div className="admin-dashboard-layout">
        <Sidebar />
        <main className="promo-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý khuyến mại</p>
              <h1 className="page-title">Khuyến mại</h1>
              <p className="page-description">Tạo, sửa và quản lý mã khuyến mại thật từ backend.</p>
            </div>
            <button className="page-action-btn" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Đóng" : "Thêm khuyến mại"}
            </button>
          </header>

          {error && <div className="promo-error">{error}</div>}

          <section className="promo-filters">
            <div className="filter-field">
              <label>Tìm kiếm</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập mã hoặc tên khuyến mại"
              />
            </div>
            <div className="filter-field">
              <label>Trạng thái</label>
              <CustomSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={filterStatusOptions}
              />
            </div>
          </section>

          {showForm && (
            <section className="promo-filters" style={{ marginBottom: 24 }}>
              <form onSubmit={handleSubmit} style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
                <div className="promo-filters">
                  <div className="filter-field">
                    <label>Mã <span>*</span></label>
                    <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Tên <span>*</span></label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                </div>
                <div className="promo-filters">
                  <div className="filter-field">
                    <label>Loại giảm</label>
                    <CustomSelect
                      value={form.discountType}
                      onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
                      options={discountTypeOptions}
                    />
                  </div>
                  <div className="filter-field">
                    <label>Giá trị giảm <span>*</span></label>
                    <input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                  </div>
                </div>
                <div className="promo-filters">
                  <div className="filter-field">
                    <label>Bắt đầu</label>
                    <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="filter-field">
                    <label>Kết thúc</label>
                    <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
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
                    {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Lưu khuyến mại"}
                  </button>
                  <button className="action-btn delete" type="button" onClick={resetForm} disabled={saving}>
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="promo-table">
            <div className="promo-table-head">
              <span>Mã</span>
              <span>Tên</span>
              <span>Loại</span>
              <span>Giá trị</span>
              <span>Thời gian</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>
            {loading ? (
              <div className="empty-state">Đang tải khuyến mại...</div>
            ) : filteredPromotions.length > 0 ? (
              filteredPromotions.map((item) => (
                <div className="promo-table-row" key={item.id}>
                  <span>{item.code}</span>
                  <span>{item.name}</span>
                  <span>{item.discountType}</span>
                  <span>{item.discountValue}</span>
                  <span>
                    {item.startDate ? new Date(item.startDate).toLocaleString("vi-VN") : "-"}
                    <br />
                    {item.endDate ? new Date(item.endDate).toLocaleString("vi-VN") : "-"}
                  </span>
                  <span>{item.active ? "Hoạt động" : "Tắt"}</span>
                  <span className="row-actions">
                    <button className="action-btn edit" type="button" onClick={() => startEdit(item)} disabled={saving}>
                      Sửa
                    </button>
                    <button className="action-btn delete" type="button" onClick={() => handleDelete(item.id)} disabled={saving}>
                      Xóa
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">Không có khuyến mại nào phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
