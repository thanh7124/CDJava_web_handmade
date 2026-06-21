import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "../../services/user.service";
import "./AdminCrud.css";

const emptyEditForm = {
  fullName: "",
  phone: "",
  role: "USER",
  active: true,
};

const roleFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "USER", label: "USER" },
];

const roleEditOptions = [
  { value: "USER", label: "USER" },
  { value: "ADMIN", label: "ADMIN" },
];

const statusEditOptions = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Khóa" },
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const loadUsers = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminUsers(token);
      setUsers(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return users.filter((item) => {
      const matchesQuery =
        !lowerQuery ||
        (item.fullName || "").toLowerCase().includes(lowerQuery) ||
        (item.email || "").toLowerCase().includes(lowerQuery);
      const matchesRole = roleFilter === "ALL" || item.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, users]);

  const startEdit = (item) => {
    setEditingUserId(item.id);
    setEditForm({
      fullName: item.fullName || "",
      phone: item.phone || "",
      role: item.role || "USER",
      active: Boolean(item.active),
    });
    setError("");
  };

  const resetEdit = () => {
    setEditingUserId(null);
    setEditForm(emptyEditForm);
    setError("");
  };

  const handleEditChange = (field) => (event) => {
    const value = field === "active" ? event.target.value === "true" : event.target.value;

    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (event, id) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateAdminUser(token, id, editForm);
      resetEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được người dùng");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;

    setSaving(true);
    setError("");

    try {
      await deleteAdminUser(token, id);
      if (editingUserId === id) resetEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được người dùng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page manage-users-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý người dùng</p>
              <h1 className="page-title">Người dùng</h1>
              <p className="page-description">
                Xem, tìm kiếm, sửa vai trò và trạng thái tài khoản người dùng.
              </p>
            </div>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm kiếm</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên hoặc email"
              />
            </div>
            <div className="filter-field">
              <label>Vai trò</label>
              <CustomSelect
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={roleFilterOptions}
              />
            </div>
          </section>

          <section className="manage-products-table user-table">
            <div className="table-head">
              <span>ID</span>
              <span>Họ và tên</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
              <span>Tham gia</span>
              <span>Hành động</span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải người dùng...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((item) => {
                const isEditing = editingUserId === item.id;
                const joined = item.createdDate
                  ? new Date(item.createdDate).toLocaleDateString("vi-VN")
                  : "-";

                return isEditing ? (
                  <form
                    key={item.id}
                    className="table-row category-inline-edit"
                    onSubmit={(event) => handleSave(event, item.id)}
                  >
                    <span>{item.id}</span>
                    <span>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={handleEditChange("fullName")}
                        placeholder="Họ và tên"
                      />
                    </span>
                    <span>{item.email}</span>
                    <span>
                      <CustomSelect
                        value={editForm.role}
                        onChange={handleEditChange("role")}
                        options={roleEditOptions}
                      />
                    </span>
                    <span>
                      <CustomSelect
                        value={String(editForm.active)}
                        onChange={handleEditChange("active")}
                        options={statusEditOptions}
                      />
                    </span>
                    <span>{joined}</span>
                    <span className="row-actions">
                      <button className="action-btn edit" type="submit" disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        className="action-btn delete"
                        type="button"
                        onClick={resetEdit}
                        disabled={saving}
                      >
                        Hủy
                      </button>
                    </span>
                  </form>
                ) : (
                  <div className="table-row user-table-row" key={item.id}>
                    <span>{item.id}</span>
                    <span>
                      <button
                        className="user-name-link"
                        type="button"
                        onClick={() => navigate(`/manage-users/${item.id}`)}
                      >
                        {item.fullName || "Chưa cập nhật"}
                      </button>
                    </span>
                    <span className="user-email-cell" title={item.email}>
                      {item.email}
                    </span>
                    <span>{item.role}</span>
                    <span className={`status-pill ${item.active ? "in-stock" : "out-of-stock"}`}>
                      {item.active ? "Hoạt động" : "Khóa"}
                    </span>
                    <span>{joined}</span>
                    <span className="row-actions">
                      <button
                        className="action-btn details"
                        type="button"
                        onClick={() => navigate(`/manage-users/${item.id}`)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="action-btn edit"
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={saving}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={saving || item.id === user?.id}
                      >
                        Xóa
                      </button>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">Không có người dùng nào phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
