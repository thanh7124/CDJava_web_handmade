import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  deleteOrderApi,
  fetchAdminOrders,
  updateOrderStatusApi,
} from "../../services/adminOrder.service";
import "./AdminCrud.css";

const statusLabel = {
  PENDING: "Đang xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const statusUpdateOptions = statusFilterOptions.filter((item) => item.value !== "ALL");

export default function ManageOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token || "";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");

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
      return matchesQuery && matchesStatus;
    });
  }, [query, status, orders]);

  const startEdit = (order) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status || "PENDING");
    setError("");
  };

  const resetEdit = () => {
    setEditingOrderId(null);
    setEditStatus("PENDING");
    setError("");
  };

  const handleSaveStatus = async (id) => {
    setSaving(true);
    setError("");
    try {
      await updateOrderStatusApi(token, id, editStatus);
      resetEdit();
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được đơn hàng");
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
      if (editingOrderId === id) resetEdit();
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
                Theo dõi, tìm kiếm và cập nhật trạng thái các đơn hàng.
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
              <label>Trạng thái</label>
              <CustomSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusFilterOptions}
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
                const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

                return isEditing ? (
                  <div className="table-row category-inline-edit" key={order.id}>
                    <span>{order.id}</span>
                    <span>{order.recipientName}</span>
                    <span>{order.phone}</span>
                    <span>{Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ</span>
                    <span>{itemCount}</span>
                    <span>
                      <CustomSelect
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        options={statusUpdateOptions}
                      />
                    </span>
                    <span className="row-actions">
                      <button className="action-btn edit" type="button" onClick={() => handleSaveStatus(order.id)} disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button className="action-btn delete" type="button" onClick={resetEdit} disabled={saving}>
                        Hủy
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="table-row" key={order.id}>
                    <span>{order.id}</span>
                    <span>{order.recipientName}</span>
                    <span>{order.phone}</span>
                    <span>{Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ</span>
                    <span>{itemCount}</span>
                    <span className={`status-pill ${order.status === "COMPLETED" ? "in-stock" : order.status === "SHIPPED" ? "low-stock" : order.status === "CANCELLED" ? "out-of-stock" : "status-processing"}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                    <span className="row-actions">
                      <button
                        className="action-btn details"
                        type="button"
                        onClick={() => navigate(`/manage-orders/${order.id}`)}
                      >
                        Chi tiết
                      </button>
                      <button className="action-btn edit" type="button" onClick={() => startEdit(order)} disabled={saving}>
                        Sửa
                      </button>
                      <button className="action-btn delete" type="button" onClick={() => handleDelete(order.id)} disabled={saving}>
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
