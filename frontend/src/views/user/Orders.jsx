import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { fetchMyOrdersApi } from "../../services/order.service";
import { formatCurrency } from "../../services/product.service";

import "./Orders.css";
import "./Home.css";

function getStatusLabel(status) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status || "Không rõ";
  }
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders() {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      const data = await fetchMyOrdersApi(user.token);

      setOrders(data || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể tải đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadOrders();
  }, [isAuthenticated, user?.token]);

  return (
    <div className="home-page orders-page">
      <Header />

      <main className="orders-container">
        <div className="orders-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={15} />
          <span>Đơn hàng của tôi</span>
        </div>

        <div className="orders-header">
          <div>
            <p>Đơn hàng</p>
            <h1>Lịch sử mua hàng</h1>
            <span>Theo dõi các đơn hàng bạn đã đặt tại HandmadeShop.</span>
          </div>

          <Link to="/products" className="orders-shop-btn">
            <ShoppingBag size={18} />
            Tiếp tục mua sắm
          </Link>
        </div>

        {loading && <div className="orders-state">Đang tải đơn hàng...</div>}

        {error && <div className="orders-error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <Package size={52} />
            <h2>Bạn chưa có đơn hàng nào</h2>
            <p>Hãy khám phá các sản phẩm handmade và đặt đơn hàng đầu tiên.</p>
            <Link to="/products">Khám phá sản phẩm</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div>
                    <h3>Đơn hàng #{order.id}</h3>
                    <span>{formatDate(order.createdDate)}</span>
                  </div>

                  <span className={`order-status ${order.status?.toLowerCase()}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-products-preview">
                  {(order.items || []).slice(0, 3).map((item) => (
                    <div className="order-product-mini" key={item.id}>
                      <img src={item.image} alt={item.productName} />
                      <div>
                        <strong>{item.productName}</strong>
                        <span>x{item.quantity}</span>
                      </div>
                    </div>
                  ))}

                  {order.items?.length > 3 && (
                    <span className="order-more">
                      +{order.items.length - 3} sản phẩm khác
                    </span>
                  )}
                </div>

                <div className="order-card-bottom">
                  <div>
                    <span>Tổng thanh toán</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>

                  <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;