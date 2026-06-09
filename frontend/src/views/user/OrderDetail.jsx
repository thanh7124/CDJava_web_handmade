import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, User } from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { fetchOrderByIdApi } from "../../services/order.service";
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

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrder() {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      const data = await fetchOrderByIdApi(user.token, id);

      setOrder(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể tải chi tiết đơn hàng"
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

    loadOrder();
  }, [isAuthenticated, user?.token, id]);

  return (
    <div className="home-page orders-page">
      <Header />

      <main className="orders-container">
        <Link to="/orders" className="order-back-link">
          <ArrowLeft size={18} />
          Quay lại đơn hàng
        </Link>

        {loading && <div className="orders-state">Đang tải chi tiết đơn hàng...</div>}

        {error && <div className="orders-error">{error}</div>}

        {!loading && order && (
          <>
            <div className="order-detail-header">
              <div>
                <p>Chi tiết đơn hàng</p>
                <h1>Đơn hàng #{order.id}</h1>
                <span>Ngày đặt: {formatDate(order.createdDate)}</span>
              </div>

              <span className={`order-status ${order.status?.toLowerCase()}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <section className="order-detail-layout">
              <div className="order-detail-main">
                <div className="order-detail-card">
                  <h2>Sản phẩm đã đặt</h2>

                  <div className="order-detail-items">
                    {(order.items || []).map((item) => (
                      <div className="order-detail-item" key={item.id}>
                        <img src={item.image} alt={item.productName} />

                        <div>
                          <h3>{item.productName}</h3>
                          <span>Số lượng: {item.quantity}</span>
                          <p>Đơn giá: {formatCurrency(item.price)}</p>
                        </div>

                        <strong>{formatCurrency(item.totalPrice)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="order-detail-side">
                <div className="order-detail-card">
                  <h2>Thông tin nhận hàng</h2>

                  <div className="order-info-line">
                    <User size={17} />
                    <span>{order.recipientName}</span>
                  </div>

                  <div className="order-info-line">
                    <Phone size={17} />
                    <span>{order.phone}</span>
                  </div>

                  <div className="order-info-line">
                    <MapPin size={17} />
                    <span>{order.address}</span>
                  </div>

                  {order.note && (
                    <p className="order-note">Ghi chú: {order.note}</p>
                  )}
                </div>

                <div className="order-detail-card">
                  <h2>Thanh toán</h2>

                  <div className="order-price-line">
                    <span>Tạm tính</span>
                    <strong>{formatCurrency(order.subtotal)}</strong>
                  </div>

                  <div className="order-price-line">
                    <span>Phí vận chuyển</span>
                    <strong>
                      {Number(order.shippingFee) === 0
                        ? "Miễn phí"
                        : formatCurrency(order.shippingFee)}
                    </strong>
                  </div>

                  <div className="order-price-line total">
                    <span>Tổng cộng</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>

                  <div className="order-payment-method">
                    Phương thức: <strong>{order.paymentMethod}</strong>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetail;