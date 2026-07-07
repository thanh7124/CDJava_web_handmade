import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminUsers } from "../../services/user.service";
import { fetchAdminOrders } from "../../services/adminOrder.service";
import { fetchAdminProducts } from "../../services/adminProduct.service";
import { fetchAdminCategories } from "../../services/category.service";
import "./Dashboard.css";

const orderStatusLabel = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",

  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn thành",
};

const statusOrder = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

function getOrderStatusLabel(status) {
  return orderStatusLabel[status] || status || "Chưa cập nhật";
}

function getOrderStatusClass(status) {
  switch (status) {
    case "DELIVERED":
    case "COMPLETED":
      return "success";

    case "CANCELLED":
      return "danger";

    case "PENDING":
    case "CONFIRMED":
    case "SHIPPING":
    case "PROCESSING":
    case "SHIPPED":
    default:
      return "pending";
  }
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}tr`;
  }

  if (number >= 1000) {
    return `${Math.round(number / 1000)}k`;
  }

  return String(number);
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseInputDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return toInputDate(date);
}

function getDefaultToDate() {
  return toInputDate(new Date());
}

function getDayKey(date) {
  return toInputDate(date);
}

function getDayLabel(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getMonthLabel(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function createDateBuckets(fromDate, toDate, groupBy) {
  const buckets = [];

  if (!fromDate || !toDate || fromDate > toDate) {
    return buckets;
  }

  const cursor = new Date(fromDate);

  if (groupBy === "month") {
    cursor.setDate(1);

    const end = new Date(toDate);
    end.setDate(1);

    while (cursor <= end) {
      buckets.push({
        key: getMonthKey(cursor),
        label: getMonthLabel(cursor),
        revenue: 0,
        orders: 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
  }

  while (cursor <= toDate) {
    buckets.push({
      key: getDayKey(cursor),
      label: getDayLabel(cursor),
      revenue: 0,
      orders: 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
}

export default function Dashboard() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [toDate, setToDate] = useState(getDefaultToDate);
  const [chartMetric, setChartMetric] = useState("revenue");
  const [groupBy, setGroupBy] = useState("day");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const [userResult, orderResult, productResult, categoryResult] =
          await Promise.all([
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
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được dữ liệu tổng quan"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const filteredOrders = useMemo(() => {
    const from = parseInputDate(fromDate);
    const to = parseInputDate(toDate);

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return orders.filter((order) => {
      if (!order.createdDate) return false;

      const createdAt = new Date(order.createdDate);

      if (Number.isNaN(createdAt.getTime())) return false;
      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;

      return true;
    });
  }, [orders, fromDate, toDate]);

  const chartData = useMemo(() => {
    const from = parseInputDate(fromDate);
    const to = parseInputDate(toDate);

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    const buckets = createDateBuckets(from, to, groupBy);
    const bucketMap = new Map(buckets.map((item) => [item.key, item]));

    filteredOrders.forEach((order) => {
      if (!order.createdDate) return;

      const createdAt = new Date(order.createdDate);

      const key = groupBy === "month" ? getMonthKey(createdAt) : getDayKey(createdAt);
      const bucket = bucketMap.get(key);

      if (!bucket) return;

      bucket.orders += 1;

      if (order.status !== "CANCELLED") {
        bucket.revenue += Number(order.totalAmount || 0);
      }
    });

    return buckets;
  }, [filteredOrders, fromDate, toDate, groupBy]);

  const statusChartData = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      label: getOrderStatusLabel(status),
      count: filteredOrders.filter((order) => order.status === status).length,
    }));
  }, [filteredOrders]);

  const dashboardStats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => {
      if (order.status === "CANCELLED") return sum;
      return sum + Number(order.totalAmount || 0);
    }, 0);

    const activeUsers = users.filter((item) => item.active !== false).length;

    const lowStock = products.filter(
      (item) => Number(item.stock || 0) <= 10
    ).length;

    return [
      {
        title: "Đơn hàng",
        value: orders.length.toLocaleString("vi-VN"),
        subtitle: "Tổng đơn hàng trong hệ thống",
      },
      {
        title: "Doanh thu",
        value: formatCurrency(revenue),
        subtitle: "Không tính đơn đã hủy",
      },
      {
        title: "Khách hàng",
        value: activeUsers.toLocaleString("vi-VN"),
        subtitle: "Tài khoản đang hoạt động",
      },
      {
        title: "Sản phẩm sắp hết",
        value: lowStock.toLocaleString("vi-VN"),
        subtitle: "Cần kiểm tra kho",
      },
    ];
  }, [orders, products, users]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
      )
      .slice(0, 4);
  }, [orders]);

  const chartTitle =
    chartMetric === "revenue"
      ? "Doanh thu theo thời gian"
      : "Số đơn hàng theo thời gian";

  const chartDataKey = chartMetric === "revenue" ? "revenue" : "orders";

  const chartTooltipFormatter = (value) => {
    if (chartMetric === "revenue") {
      return [formatCurrency(value), "Doanh thu"];
    }

    return [Number(value || 0).toLocaleString("vi-VN"), "Số đơn"];
  };

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
                Tổng quan dữ liệu thật của cửa hàng: đơn hàng, doanh thu,
                khách hàng và tồn kho.
              </p>
            </div>
          </header>

          {error && <div className="auth-error">{error}</div>}
          {loading && (
            <div className="auth-error">Đang tải dữ liệu tổng quan...</div>
          )}

          <section className="dashboard-grid">
            {dashboardStats.map((stat) => (
              <div className="dashboard-card" key={stat.title}>
                <span className="dashboard-card-title">{stat.title}</span>
                <h2 className="dashboard-card-value">{stat.value}</h2>
                <p className="dashboard-card-subtitle">{stat.subtitle}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-panel dashboard-chart-panel">
            <div className="panel-header chart-panel-header">
              <div>
                <h2>{chartTitle}</h2>
                <p>
                  Lọc dữ liệu theo thời gian, loại thống kê và cách nhóm dữ liệu.
                </p>
              </div>
            </div>

            <div className="dashboard-chart-controls">
              <label className="chart-filter-field">
                <span>Từ ngày</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </label>

              <label className="chart-filter-field">
                <span>Đến ngày</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </label>

              <label className="chart-filter-field">
                <span>Thống kê</span>
                <select
                  value={chartMetric}
                  onChange={(event) => setChartMetric(event.target.value)}
                >
                  <option value="revenue">Doanh thu</option>
                  <option value="orders">Số đơn hàng</option>
                </select>
              </label>

              <label className="chart-filter-field">
                <span>Nhóm theo</span>
                <select
                  value={groupBy}
                  onChange={(event) => setGroupBy(event.target.value)}
                >
                  <option value="day">Ngày</option>
                  <option value="month">Tháng</option>
                </select>
              </label>

              <label className="chart-filter-field">
                <span>Kiểu biểu đồ</span>
                <select
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                >
                  <option value="bar">Cột</option>
                  <option value="line">Đường</option>
                </select>
              </label>
            </div>

            <div className="dashboard-chart-wrapper">
              <ResponsiveContainer width="100%" height={330}>
                {chartType === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis
                      tickFormatter={
                        chartMetric === "revenue"
                          ? formatCompactCurrency
                          : (value) => value
                      }
                    />
                    <Tooltip formatter={chartTooltipFormatter} />
                    <Line
                      type="monotone"
                      dataKey={chartDataKey}
                      stroke="#b96638"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis
                      tickFormatter={
                        chartMetric === "revenue"
                          ? formatCompactCurrency
                          : (value) => value
                      }
                    />
                    <Tooltip formatter={chartTooltipFormatter} />
                    <Bar dataKey={chartDataKey} fill="#b96638" radius={[10, 10, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="chart-summary-row">
              <span>
                Tổng đơn trong khoảng:{" "}
                <strong>{filteredOrders.length.toLocaleString("vi-VN")}</strong>
              </span>
              <span>
                Doanh thu trong khoảng:{" "}
                <strong>
                  {formatCurrency(
                    filteredOrders.reduce((sum, order) => {
                      if (order.status === "CANCELLED") return sum;
                      return sum + Number(order.totalAmount || 0);
                    }, 0)
                  )}
                </strong>
              </span>
            </div>
          </section>

          <section className="dashboard-overview">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Danh mục hiện có</h2>
                  <p>Số danh mục đang được quản lý trong hệ thống.</p>
                </div>
                <span className="panel-badge">
                  {categories.length} danh mục
                </span>
              </div>

              <div className="quick-summary">
                {categories.slice(0, 3).map((item) => (
                  <div className="quick-item" key={item.id}>
                    <span className="quick-item-title">{item.name}</span>
                    <strong>{item.active ? "Hoạt động" : "Ẩn"}</strong>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="empty-state">Chưa có danh mục nào.</div>
                )}
              </div>
            </div>

            <aside className="dashboard-panel compact-panel">
              <div className="panel-header">
                <div>
                  <h2>Trạng thái đơn hàng</h2>
                  <p>Theo dõi nhanh số lượng đơn theo trạng thái.</p>
                </div>
              </div>

              <div className="dashboard-status-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={statusChartData}
                    layout="vertical"
                    margin={{ top: 8, right: 18, bottom: 8, left: 18 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value || 0).toLocaleString("vi-VN"),
                        "Số đơn",
                      ]}
                    />
                    <Bar dataKey="count" fill="#b96638" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                    <span>{formatCurrency(order.totalAmount)}</span>
                    <span
                      className={`status-badge ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
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