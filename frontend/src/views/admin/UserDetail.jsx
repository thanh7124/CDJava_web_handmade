import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminUser, updateAdminUser } from "../../services/user.service";
import "./AdminCrud.css";

const emptyEditForm = {
  fullName: "",
  phone: "",
  role: "USER",
  active: true,
};

const roleOptions = [
  { value: "USER", label: "USER" },
  { value: "ADMIN", label: "ADMIN" },
];

const activeOptions = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Khóa" },
];

const show = (value) => value || "Chưa cập nhật";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useAuth();
  const token = admin?.token || "";

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const syncEditForm = (userDetail) => {
    setEditForm({
      fullName: userDetail?.fullName || "",
      phone: userDetail?.phone || "",
      role: userDetail?.role || "USER",
      active: Boolean(userDetail?.active),
    });
  };

  const loadUser = async () => {
    if (!token) return;

    setError("");

    try {
      const userDetail = await fetchAdminUser(token, id);
      setDetail(userDetail);
      syncEditForm(userDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được người dùng");
    }
  };

  useEffect(() => {
    loadUser();
  }, [token, id]);

  const handleEditChange = (field) => (event) => {
    const value = field === "active" ? event.target.value === "true" : event.target.value;

    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartEdit = () => {
    syncEditForm(detail);
    setEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    syncEditForm(detail);
    setEditing(false);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updatedUser = await updateAdminUser(token, id, editForm);
      setDetail(updatedUser);
      syncEditForm(updatedUser);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được người dùng");
    } finally {
      setSaving(false);
    }
  };

  const joined = detail?.createdDate
    ? new Date(detail.createdDate).toLocaleString("vi-VN")
    : "Chưa có";

  return (
    <div className="admin-page">
      <div className="admin-dashboard-layout">
        <Sidebar />
        <main className="manage-products-content">
          <button className="user-detail-back" type="button" onClick={() => navigate("/manage-users")}>
            ← Quay lại danh sách
          </button>

          <header className="page-header">
            <div>
              <p className="page-label">Quản lý người dùng</p>
              <h1 className="page-title">Thông tin người dùng</h1>
            </div>

            {detail && !editing ? (
              <button className="page-action-btn" type="button" onClick={handleStartEdit}>
                Chỉnh sửa
              </button>
            ) : null}
          </header>

          {error && <div className="auth-error">{error}</div>}
          {!error && !detail && <div className="empty-state">Đang tải thông tin...</div>}

          {detail && (
            <article className="user-detail-card">
              <div className="user-detail-heading">
                <div className="user-detail-avatar">{(detail.fullName || "U").charAt(0).toUpperCase()}</div>
                <div>
                  <h2>{show(detail.fullName)}</h2>
                  <p>{detail.email}</p>
                </div>
              </div>

              {editing ? (
                <form className="user-detail-grid" onSubmit={handleSave}>
                  <div className="user-detail-item">
                    <dt>ID</dt>
                    <dd>{detail.id}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Email</dt>
                    <dd>{show(detail.email)}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Họ và tên</dt>
                    <dd>
                      <input
                        className="user-detail-input"
                        type="text"
                        value={editForm.fullName}
                        onChange={handleEditChange("fullName")}
                        placeholder="Nhập họ và tên"
                      />
                    </dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Số điện thoại</dt>
                    <dd>
                      <input
                        className="user-detail-input"
                        type="text"
                        value={editForm.phone}
                        onChange={handleEditChange("phone")}
                        placeholder="Nhập số điện thoại"
                      />
                    </dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Vai trò</dt>
                    <dd>
                      <CustomSelect
                        value={editForm.role}
                        onChange={handleEditChange("role")}
                        options={roleOptions}
                      />
                    </dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Trạng thái</dt>
                    <dd>
                      <CustomSelect
                        value={String(editForm.active)}
                        onChange={handleEditChange("active")}
                        options={activeOptions}
                      />
                    </dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Ngày tham gia</dt>
                    <dd>{joined}</dd>
                  </div>
                  <div className="user-detail-item address">
                    <dt>Địa chỉ</dt>
                    <dd>{show(detail.address)}</dd>
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
                <dl className="user-detail-grid">
                  <div className="user-detail-item">
                    <dt>ID</dt>
                    <dd>{detail.id}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Vai trò</dt>
                    <dd>{show(detail.role)}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Email</dt>
                    <dd>{show(detail.email)}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Số điện thoại</dt>
                    <dd>{show(detail.phone)}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Trạng thái</dt>
                    <dd>{detail.active ? "Hoạt động" : "Đã khóa"}</dd>
                  </div>
                  <div className="user-detail-item">
                    <dt>Ngày tham gia</dt>
                    <dd>{joined}</dd>
                  </div>
                  <div className="user-detail-item address">
                    <dt>Địa chỉ</dt>
                    <dd>{show(detail.address)}</dd>
                  </div>
                </dl>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
