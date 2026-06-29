import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  deleteOrderApi,
  fetchAdminOrders,
  updateOrderPaymentApi,
  updateOrderStatusApi,
} from "../../services/adminOrder.service";
import "./AdminCrud.css";

const statusLabel = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang vận chuyển",
  DELIVERED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",

  // giữ tương thích dữ liệu cũ nếu DB còn status cũ
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
};

const paymentStatusLabel = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ xác nhận",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const paymentMethodLabel = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  BANKING: "Chuyển khoản",
};

const statusFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang vận chuyển" },
  { value: "DELIVERED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const statusUpdateOptions = statusFilterOptions.filter(
  (item) => item.value !== "ALL"
);

const paymentFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const paymentUpdateOptions = paymentFilterOptions.filter(
  (item) => item.value !== "ALL"
);

function getStatusClass(status) {
  if (status === "DELIVERED" || status === "COMPLETED") {
    return "in-stock";
  }

  if (status === "SHIPPING" || status === "SHIPPED" || status === "CONFIRMED") {
    return "low-stock";
  }

  if (status === "CANCELLED") {
    return "out-of-stock";
  }

  return "status-processing";
}

function getPaymentClass(status) {
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

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export default function ManageOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editPaymentStatus, setEditPaymentStatus] = useState("UNPAID");

  const loadOrders = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminOrders(token);
      setOrders(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        !keyword ||
        String(order.id).toLowerCase().includes(keyword) ||
        (order.recipientName || "").toLowerCase().includes(keyword) ||
        (order.phone || "").toLowerCase().includes(keyword);

      const matchesStatus = status === "ALL" || order.status === status;

      const matchesPaymentStatus =
        paymentStatus === "ALL" ||
        (order.paymentStatus || "UNPAID") === paymentStatus;

      return matchesQuery && matchesStatus && matchesPaymentStatus;
    });
  }, [query, status, paymentStatus, orders]);

  const startEdit = (order) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status || "PENDING");
    setEditPaymentStatus(order.paymentStatus || "UNPAID");
    setError("");
  };

  const resetEdit = () => {
    setEditingOrderId(null);
    setEditStatus("PENDING");
    setEditPaymentStatus("UNPAID");
    setError("");
  };

  const handleSaveOrder = async (order) => {
    setSaving(true);
    setError("");

    try {
      let updatedOrder = order;

      if (editStatus !== order.status) {
        updatedOrder = await updateOrderStatusApi(token, order.id, editStatus);
      }

      if (editPaymentStatus !== (order.paymentStatus || "UNPAID")) {
        const transactionCode =
          editPaymentStatus === "PAID"
            ? order.transactionCode || `ADMIN-${Date.now()}`
            : order.transactionCode || "";

        const note =
          editPaymentStatus === "PAID"
            ? "Admin xác nhận thanh toán"
            : "Admin cập nhật trạng thái thanh toán";

        updatedOrder = await updateOrderPaymentApi(token, order.id, {
          paymentStatus: editPaymentStatus,
          transactionCode,
          note,
        });
      }

      setOrders((current) =>
        current.map((item) => (item.id === order.id ? updatedOrder : item))
      );

      resetEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không cập nhật được đơn hàng"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) return;

    setSaving(true);
    setError("");

    try {
      await deleteOrderApi(token, id);

      if (editingOrderId === id) {
        resetEdit();
      }

      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được đơn hàng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page manage-orders-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý đơn hàng</p>
              <h1 className="page-title">Đơn hàng</h1>
              <p className="page-description">
                Theo dõi, tìm kiếm, xác nhận thanh toán và cập nhật trạng thái
                các đơn hàng.
              </p>
            </div>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm đơn hàng</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mã đơn, người nhận, số điện thoại"
              />
            </div>

            <div className="filter-field">
              <label>Trạng thái đơn</label>
              <CustomSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusFilterOptions}
              />
            </div>

            <div className="filter-field">
              <label>Thanh toán</label>
              <CustomSelect
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                options={paymentFilterOptions}
              />
            </div>
          </section>

          <section className="manage-products-table">
            <div className="table-head">
              <span>ID</span>
              <span>Người nhận</span>
              <span>SĐT</span>
              <span>Tổng tiền</span>
              <span>Số món</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải đơn hàng...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const isEditing = editingOrderId === order.id;
                const itemCount =
                  order.items?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  ) || 0;

                const currentPaymentStatus = order.paymentStatus || "UNPAID";

                return isEditing ? (
                  <div className="table-row category-inline-edit" key={order.id}>
                    <span>{order.id}</span>

                    <span>{order.recipientName}</span>

                    <span>{order.phone}</span>

                    <span>{formatCurrency(order.totalAmount)}</span>

                    <span>{itemCount}</span>

                    <span>
                      <CustomSelect
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        options={statusUpdateOptions}
                      />

                      <div style={{ height: 8 }} />

                      <CustomSelect
                        value={editPaymentStatus}
                        onChange={(e) =>
                          setEditPaymentStatus(e.target.value)
                        }
                        options={paymentUpdateOptions}
                      />
                    </span>

                    <span className="row-actions">
                      <button
                        className="action-btn edit"
                        type="button"
                        onClick={() => handleSaveOrder(order)}
                        disabled={saving}
                      >
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
                  </div>
                ) : (
                  <div className="table-row" key={order.id}>
                    <span>{order.id}</span>

                    <span>{order.recipientName}</span>

                    <span>{order.phone}</span>

                    <span>{formatCurrency(order.totalAmount)}</span>

                    <span>{itemCount}</span>

                    <span>
                      <span
                        className={`status-pill ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>

                      <div style={{ height: 6 }} />

                      <span
                        className={`status-pill ${getPaymentClass(
                          currentPaymentStatus
                        )}`}
                      >
                        {paymentMethodLabel[order.paymentMethod] ||
                          order.paymentMethod ||
                          "COD"}{" "}
                        -{" "}
                        {paymentStatusLabel[currentPaymentStatus] ||
                          currentPaymentStatus}
                      </span>
                    </span>

                    <span className="row-actions">
                      <button
                        className="action-btn details"
                        type="button"
                        onClick={() => navigate(`/manage-orders/${order.id}`)}
                      >
                        Chi tiết
                      </button>

                      <button
                        className="action-btn edit"
                        type="button"
                        onClick={() => startEdit(order)}
                        disabled={saving}
                      >
                        Sửa
                      </button>

                      <button
                        className="action-btn delete"
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        disabled={saving}
                      >
                        Xóa
                      </button>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">Không có đơn hàng nào phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}