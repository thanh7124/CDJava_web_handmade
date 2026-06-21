import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminOrder,
  updateOrderStatusApi,
} from "../../services/adminOrder.service";
import { formatCurrency } from "../../services/product.service";
import "./AdminCrud.css";

const statusLabel = {
  PENDING: "Đang xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusOptions = [
  { value: "PENDING", label: "Đang xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const paymentLabel = {
  COD: "Thanh toán khi nhận hàng",
  BANKING: "Chuyển khoản",
  MOMO: "Ví điện tử",
};

const show = (value) => value || "Chưa cập nhật";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("PENDING");

  const itemCount = useMemo(
    () => detail?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [detail]
  );

  const loadOrder = async () => {
    if (!token) return;

    setError("");

    try {
      const orderDetail = await fetchAdminOrder(token, id);
      setDetail(orderDetail);
      setStatus(orderDetail?.status || "PENDING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được chi tiết đơn hàng");
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id, token]);

  const handleStartEdit = () => {
    setStatus(detail?.status || "PENDING");
    setEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    setStatus(detail?.status || "PENDING");
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const updated = await updateOrderStatusApi(token, id, status);
      setDetail(updated);
      setStatus(updated?.status || status);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được đơn hàng");
    } finally {
      setSaving(false);
    }
  };

  const createdDate = detail?.createdDate
    ? new Date(detail.createdDate).toLocaleString("vi-VN")
    : "Chưa có";

  return (
    <div className="admin-page">
      <div className="admin-dashboard-layout">
        <Sidebar />
        <main className="manage-products-content">
          <button className="user-detail-back" type="button" onClick={() => navigate("/manage-orders")}>
            ← Quay lại danh sách
          </button>

          <header className="page-header">
            <div>
              <p className="page-label">Quản lý đơn hàng</p>
              <h1 className="page-title">Chi tiết đơn hàng</h1>
              <p className="page-description">Xem thông tin đơn hàng và cập nhật trạng thái ngay tại đây.</p>
            </div>
            {detail && !editing ? (
              <button className="page-action-btn" type="button" onClick={handleStartEdit}>
                Chỉnh sửa
              </button>
            ) : null}
          </header>

          {error && <div className="auth-error">{error}</div>}
          {!error && !detail && <div className="empty-state">Đang tải chi tiết đơn hàng...</div>}

          {detail ? (
            <article className="order-detail-card">
              <div className="order-detail-header-card">
                <div>
                  <p className="page-label">Đơn hàng #{detail.id}</p>
                  <h2>{show(detail.recipientName)}</h2>
                  <p className="page-description">Ngày đặt: {createdDate}</p>
                </div>
                {editing ? (
                  <div className="order-detail-status-editor">
                    <label>Trạng thái</label>
                    <CustomSelect
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      options={statusOptions}
                    />
                  </div>
                ) : (
                  <span className={`status-pill ${detail.status === "COMPLETED" ? "in-stock" : detail.status === "SHIPPED" ? "low-stock" : detail.status === "CANCELLED" ? "out-of-stock" : "status-processing"}`}>
                    {statusLabel[detail.status] || detail.status}
                  </span>
                )}
              </div>

              <div className="order-detail-grid">
                <div className="order-detail-section">
                  <h3>Thông tin nhận hàng</h3>
                  <div className="order-detail-info-list">
                    <div className="order-detail-info-item"><span>Người nhận</span><strong>{show(detail.recipientName)}</strong></div>
                    <div className="order-detail-info-item"><span>Số điện thoại</span><strong>{show(detail.phone)}</strong></div>
                    <div className="order-detail-info-item full"><span>Địa chỉ</span><strong>{show(detail.address)}</strong></div>
                    <div className="order-detail-info-item full"><span>Ghi chú</span><strong>{show(detail.note)}</strong></div>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h3>Thanh toán</h3>
                  <div className="order-detail-info-list">
                    <div className="order-detail-info-item"><span>Phương thức</span><strong>{paymentLabel[detail.paymentMethod] || show(detail.paymentMethod)}</strong></div>
                    <div className="order-detail-info-item"><span>Số món</span><strong>{itemCount}</strong></div>
                    <div className="order-detail-info-item"><span>Tạm tính</span><strong>{formatCurrency(detail.subtotal || 0)}</strong></div>
                    <div className="order-detail-info-item"><span>Phí vận chuyển</span><strong>{formatCurrency(detail.shippingFee || 0)}</strong></div>
                    <div className="order-detail-info-item"><span>Tổng cộng</span><strong>{formatCurrency(detail.totalAmount || 0)}</strong></div>
                  </div>
                </div>
              </div>

              <section className="order-detail-section order-detail-items-section">
                <h3>Sản phẩm đã đặt</h3>
                <div className="order-detail-items">
                  {(detail.items || []).map((item) => (
                    <div className="order-detail-row" key={item.id}>
                      <div className="order-detail-product">
                        <img src={item.image} alt={item.productName} />
                        <div>
                          <strong>{item.productName}</strong>
                          <span>Số lượng: {item.quantity}</span>
                        </div>
                      </div>
                      <span>{formatCurrency(item.price || 0)}</span>
                      <strong>{formatCurrency(item.totalPrice || 0)}</strong>
                    </div>
                  ))}
                </div>
              </section>

              {editing ? (
                <div className="user-detail-actions">
                  <button className="action-btn edit" type="button" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button className="action-btn delete" type="button" onClick={handleCancelEdit} disabled={saving}>
                    Hủy
                  </button>
                </div>
              ) : null}
            </article>
          ) : null}
        </main>
      </div>
    </div>
  );
}
