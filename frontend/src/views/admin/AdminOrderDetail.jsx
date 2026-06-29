import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminOrder,
  updateAdminOrderApi,
  updateOrderPaymentApi,
  updateOrderStatusApi,
} from "../../services/adminOrder.service";
import { formatCurrency } from "../../services/product.service";
import "./AdminCrud.css";

const statusLabel = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang vận chuyển",
  DELIVERED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",

  // tương thích dữ liệu cũ nếu DB còn
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
};

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang vận chuyển" },
  { value: "DELIVERED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const paymentLabel = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  BANKING: "Chuyển khoản ngân hàng",
  MOMO: "Ví điện tử",
};

const paymentMethodOptions = [
  { value: "COD", label: "Thanh toán khi nhận hàng" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
];

const paymentStatusLabel = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ xác nhận",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const paymentStatusOptions = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const show = (value) => value || "Chưa cập nhật";

function normalizeStatus(status) {
  if (status === "COMPLETED") return "DELIVERED";
  if (status === "SHIPPED") return "SHIPPING";
  if (status === "PROCESSING") return "CONFIRMED";
  return status || "PENDING";
}

function normalizePaymentMethod(method) {
  if (method === "BANKING" || method === "BANK") return "BANK_TRANSFER";
  return method || "COD";
}

function getStatusClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "DELIVERED") {
    return "in-stock";
  }

  if (normalized === "SHIPPING" || normalized === "CONFIRMED") {
    return "low-stock";
  }

  if (normalized === "CANCELLED") {
    return "out-of-stock";
  }

  return "status-processing";
}

function getPaymentStatusClass(status) {
  if (status === "PAID") {
    return "in-stock";
  }

  if (status === "PENDING") {
    return "low-stock";
  }

  if (status === "FAILED" || status === "REFUNDED") {
    return "out-of-stock";
  }

  return "status-processing";
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    status: "PENDING",
  });

  const itemCount = useMemo(
    () =>
      detail?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [detail]
  );

  const loadOrder = async () => {
    if (!token) return;

    setError("");
    setMessage("");

    try {
      const orderDetail = await fetchAdminOrder(token, id);
      setDetail(orderDetail);

      setForm({
        recipientName: orderDetail?.recipientName || "",
        phone: orderDetail?.phone || "",
        address: orderDetail?.address || "",
        note: orderDetail?.note || "",
        paymentMethod: normalizePaymentMethod(orderDetail?.paymentMethod),
        paymentStatus: orderDetail?.paymentStatus || "UNPAID",
        status: normalizeStatus(orderDetail?.status),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được chi tiết đơn hàng"
      );
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id, token]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStartEdit = () => {
    if (!detail) return;

    setForm({
      recipientName: detail?.recipientName || "",
      phone: detail?.phone || "",
      address: detail?.address || "",
      note: detail?.note || "",
      paymentMethod: normalizePaymentMethod(detail?.paymentMethod),
      paymentStatus: detail?.paymentStatus || "UNPAID",
      status: normalizeStatus(detail?.status),
    });

    setEditing(true);
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    if (detail) {
      setForm({
        recipientName: detail?.recipientName || "",
        phone: detail?.phone || "",
        address: detail?.address || "",
        note: detail?.note || "",
        paymentMethod: normalizePaymentMethod(detail?.paymentMethod),
        paymentStatus: detail?.paymentStatus || "UNPAID",
        status: normalizeStatus(detail?.status),
      });
    }

    setEditing(false);
    setError("");
    setMessage("");
  };

  const handleSave = async () => {
    if (!detail) return;

    if (!form.recipientName.trim()) {
      setError("Tên người nhận không được để trống");
      return;
    }

    if (!form.phone.trim()) {
      setError("Số điện thoại không được để trống");
      return;
    }

    if (!form.address.trim()) {
      setError("Địa chỉ không được để trống");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let updated = detail;

      updated = await updateAdminOrderApi(token, id, {
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note,
        paymentMethod: form.paymentMethod,
      });

      if (form.paymentStatus !== (updated.paymentStatus || "UNPAID")) {
        const transactionCode =
          form.paymentStatus === "PAID"
            ? updated.transactionCode || `ADMIN-${Date.now()}`
            : updated.transactionCode || "";

        const note =
          form.paymentStatus === "PAID"
            ? "Admin xác nhận thanh toán"
            : "Admin cập nhật trạng thái thanh toán";

        updated = await updateOrderPaymentApi(token, id, {
          paymentStatus: form.paymentStatus,
          transactionCode,
          note,
        });
      }

      if (form.status !== normalizeStatus(updated.status)) {
        updated = await updateOrderStatusApi(token, id, form.status);
      }

      setDetail(updated);

      setForm({
        recipientName: updated?.recipientName || "",
        phone: updated?.phone || "",
        address: updated?.address || "",
        note: updated?.note || "",
        paymentMethod: normalizePaymentMethod(updated?.paymentMethod),
        paymentStatus: updated?.paymentStatus || "UNPAID",
        status: normalizeStatus(updated?.status),
      });

      setEditing(false);
      setMessage("Cập nhật đơn hàng thành công.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không cập nhật được đơn hàng"
      );
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
          <button
            className="user-detail-back"
            type="button"
            onClick={() => navigate("/manage-orders")}
          >
            ← Quay lại danh sách
          </button>

          <header className="page-header">
            <div>
              <p className="page-label">Quản lý đơn hàng</p>
              <h1 className="page-title">Chi tiết đơn hàng</h1>
              <p className="page-description">
                Xem thông tin đơn hàng, cập nhật trạng thái giao hàng và thanh toán.
              </p>
            </div>

            {detail && !editing ? (
              <button
                className="page-action-btn"
                type="button"
                onClick={handleStartEdit}
              >
                Chỉnh sửa
              </button>
            ) : null}
          </header>

          {error && <div className="auth-error">{error}</div>}

          {message && (
            <div className="cart-message" style={{ marginBottom: 20 }}>
              {message}
            </div>
          )}

          {!error && !detail && (
            <div className="empty-state">Đang tải chi tiết đơn hàng...</div>
          )}

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
                    <label>Trạng thái đơn</label>
                    <CustomSelect
                      value={form.status}
                      onChange={(event) =>
                        handleChange("status", event.target.value)
                      }
                      options={statusOptions}
                    />

                    <div style={{ height: 10 }} />

                    <label>Trạng thái thanh toán</label>
                    <CustomSelect
                      value={form.paymentStatus}
                      onChange={(event) =>
                        handleChange("paymentStatus", event.target.value)
                      }
                      options={paymentStatusOptions}
                    />
                  </div>
                ) : (
                  <div>
                    <span
                      className={`status-pill ${getStatusClass(detail.status)}`}
                    >
                      {statusLabel[normalizeStatus(detail.status)] ||
                        detail.status}
                    </span>

                    <div style={{ height: 8 }} />

                    <span
                      className={`status-pill ${getPaymentStatusClass(
                        detail.paymentStatus || "UNPAID"
                      )}`}
                    >
                      {paymentStatusLabel[detail.paymentStatus || "UNPAID"] ||
                        detail.paymentStatus ||
                        "Chưa thanh toán"}
                    </span>
                  </div>
                )}
              </div>

              <div className="order-detail-grid">
                <div className="order-detail-section">
                  <h3>Thông tin nhận hàng</h3>

                  {editing ? (
                    <div className="order-detail-info-list">
                      <div className="order-detail-info-item">
                        <span>Người nhận</span>
                        <input
                          className="admin-inline-input"
                          value={form.recipientName}
                          onChange={(event) =>
                            handleChange("recipientName", event.target.value)
                          }
                        />
                      </div>

                      <div className="order-detail-info-item">
                        <span>Số điện thoại</span>
                        <input
                          className="admin-inline-input"
                          value={form.phone}
                          onChange={(event) =>
                            handleChange("phone", event.target.value)
                          }
                        />
                      </div>

                      <div className="order-detail-info-item full">
                        <span>Địa chỉ</span>
                        <textarea
                          className="admin-inline-textarea"
                          value={form.address}
                          onChange={(event) =>
                            handleChange("address", event.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div className="order-detail-info-item full">
                        <span>Ghi chú</span>
                        <textarea
                          className="admin-inline-textarea"
                          value={form.note}
                          onChange={(event) =>
                            handleChange("note", event.target.value)
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="order-detail-info-list">
                      <div className="order-detail-info-item">
                        <span>Người nhận</span>
                        <strong>{show(detail.recipientName)}</strong>
                      </div>

                      <div className="order-detail-info-item">
                        <span>Số điện thoại</span>
                        <strong>{show(detail.phone)}</strong>
                      </div>

                      <div className="order-detail-info-item full">
                        <span>Địa chỉ</span>
                        <strong>{show(detail.address)}</strong>
                      </div>

                      <div className="order-detail-info-item full">
                        <span>Ghi chú</span>
                        <strong>{show(detail.note)}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-detail-section">
                  <h3>Thanh toán</h3>

                  <div className="order-detail-info-list">
                    <div className="order-detail-info-item">
                      <span>Phương thức</span>

                      {editing ? (
                        <CustomSelect
                          value={form.paymentMethod}
                          onChange={(event) =>
                            handleChange("paymentMethod", event.target.value)
                          }
                          options={paymentMethodOptions}
                        />
                      ) : (
                        <strong>
                          {paymentLabel[normalizePaymentMethod(detail.paymentMethod)] ||
                            show(detail.paymentMethod)}
                        </strong>
                      )}
                    </div>

                    <div className="order-detail-info-item">
                      <span>Thanh toán</span>
                      <strong>
                        {paymentStatusLabel[detail.paymentStatus || "UNPAID"] ||
                          show(detail.paymentStatus)}
                      </strong>
                    </div>

                    {detail.transactionCode && (
                      <div className="order-detail-info-item">
                        <span>Mã giao dịch</span>
                        <strong>{detail.transactionCode}</strong>
                      </div>
                    )}

                    <div className="order-detail-info-item">
                      <span>Số món</span>
                      <strong>{itemCount}</strong>
                    </div>

                    <div className="order-detail-info-item">
                      <span>Tạm tính</span>
                      <strong>{formatCurrency(detail.subtotal || 0)}</strong>
                    </div>

                    <div className="order-detail-info-item">
                      <span>Phí vận chuyển</span>
                      <strong>{formatCurrency(detail.shippingFee || 0)}</strong>
                    </div>

                    <div className="order-detail-info-item">
                      <span>Tổng cộng</span>
                      <strong>{formatCurrency(detail.totalAmount || 0)}</strong>
                    </div>
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
                  <button
                    className="action-btn edit"
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                  >
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
              ) : null}
            </article>
          ) : null}
        </main>
      </div>
    </div>
  );
}