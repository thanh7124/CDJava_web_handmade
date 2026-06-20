import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminUsers } from "../../services/user.service";
import { fetchAdminOrders } from "../../services/adminOrder.service";
import { fetchAdminProducts } from "../../services/adminProduct.service";
import { fetchAdminCategories } from "../../services/category.service";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const [userResult, orderResult, productResult, categoryResult] = await Promise.all([
          fetchAdminUsers(token),
          fetchAdminOrders(token),
          fetchAdminProducts(token, { sort: "newest", page: 1, limit: 100 }),
          fetchAdminCategories(token),
        ]);

        setUsers(userResult || []);
        setOrders(orderResult || []);
        setProducts(productResult?.data || []);
        setCategories(categoryResult?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const dashboardStats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const activeUsers = users.filter((item) => item.active !== false).length;
    const lowStock = products.filter((item) => Number(item.stock || 0) <= 10).length;
    return [
      { title: "Đơn hàng", value: orders.length.toLocaleString("vi-VN"), subtitle: "Tổng đơn hàng trong hệ thống" },
      { title: "Doanh thu", value: `${revenue.toLocaleString("vi-VN")} đ`, subtitle: "Tổng doanh thu từ đơn hàng" },
      { title: "Khách hàng", value: activeUsers.toLocaleString("vi-VN"), subtitle: "Tài khoản đang hoạt động" },
      { title: "Sản phẩm sắp hết", value: lowStock.toLocaleString("vi-VN"), subtitle: "Cần kiểm tra kho" },
    ];
  }, [orders, products, users]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0))
      .slice(0, 4);
  }, [orders]);

  return (
    <div className="dashboard-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-label">Bảng điều hành</p>
              <h1 className="dashboard-title">Trang quản trị</h1>
              <p className="dashboard-description">
                Tổng quan dữ liệu thật của cửa hàng: đơn hàng, doanh thu, khách hàng và tồn kho.
              </p>
            </div>
          </header>

          {error && <div className="auth-error">{error}</div>}
          {loading && <div className="auth-error">Đang tải dữ liệu tổng quan...</div>}

          <section className="dashboard-grid">
            {dashboardStats.map((stat) => (
              <div className="dashboard-card" key={stat.title}>
                <span className="dashboard-card-title">{stat.title}</span>
                <h2 className="dashboard-card-value">{stat.value}</h2>
                <p className="dashboard-card-subtitle">{stat.subtitle}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-overview">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Danh mục hiện có</h2>
                  <p>Số danh mục đang được quản lý trong hệ thống.</p>
                </div>
                <span className="panel-badge">{categories.length} danh mục</span>
              </div>
              <div className="quick-summary">
                {categories.slice(0, 3).map((item) => (
                  <div className="quick-item" key={item.id}>
                    <span className="quick-item-title">{item.name}</span>
                    <strong>{item.active ? "Hoạt động" : "Ẩn"}</strong>
                  </div>
                ))}
                {categories.length === 0 && <div className="empty-state">Chưa có danh mục nào.</div>}
              </div>
            </div>

            <aside className="dashboard-panel compact-panel">
              <div className="panel-header">
                <div>
                  <h2>Trạng thái kho</h2>
                  <p>Đếm nhanh các sản phẩm đang cần chú ý.</p>
                </div>
              </div>
              <div className="quick-summary">
                <div className="quick-item">
                  <span className="quick-item-title">Tổng sản phẩm</span>
                  <strong>{products.length}</strong>
                </div>
                <div className="quick-item">
                  <span className="quick-item-title">Sản phẩm còn ít</span>
                  <strong>{products.filter((item) => Number(item.stock || 0) <= 10).length}</strong>
                </div>
                <div className="quick-item">
                  <span className="quick-item-title">Tài khoản khóa</span>
                  <strong>{users.filter((item) => item.active === false).length}</strong>
                </div>
              </div>
            </aside>
          </section>

          <section className="dashboard-panel recent-orders-panel">
            <div className="panel-header">
              <div>
                <h2>Đơn hàng gần đây</h2>
                <p>Danh sách đơn hàng mới nhất và trạng thái xử lý.</p>
              </div>
            </div>

            <div className="recent-orders-table">
              <div className="table-head">
                <span>Mã đơn</span>
                <span>Khách hàng</span>
                <span>Tổng tiền</span>
                <span>Trạng thái</span>
              </div>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div className="table-row" key={order.id}>
                    <span>{order.id}</span>
                    <span>{order.recipientName}</span>
                    <span>{Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ</span>
                    <span className={`status-badge ${order.status === "COMPLETED" ? "success" : order.status === "CANCELLED" ? "danger" : "pending"}`}>
                      {order.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">Chưa có đơn hàng.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
