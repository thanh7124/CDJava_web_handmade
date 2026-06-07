import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import "./Profile.css";

function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // State quản lý Tab đang hoạt động
  const [activeTab, setActiveTab] = useState("info");

  // State cho thông tin cá nhân
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [orderFilter, setOrderFilter] = useState("all");
  
  // State chung cho thông báo
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      updateUserProfile({
        id: user.id,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      });
      setEditMode(false);
      setMessage("Cập nhật thông tin thành công.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Không thể cập nhật thông tin.");
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "Không có";

  // Hàm render nội dung động dựa vào tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="profile-card">
            <div className="profile-card-header">

              <div>
                <h2>{user.fullName}</h2>

              </div>
              <button
                type="button"
                className={editMode ? "btn btn-secondary edit-toggle-btn" : "btn btn-primary edit-toggle-btn"}
                onClick={() => {
                  setMessage(null);
                  setEditMode((prev) => !prev);
                }}
              >
                {editMode ? "Hủy" : "Chỉnh sửa"}
              </button>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="profile-field">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="profile-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="profile-field">
                <label>Ngày đăng ký</label>
                <input type="text" value={joinDate} disabled />
              </div>

              {message && (
                <div className={`profile-message ${messageType}`}>{message}</div>
              )}

              {editMode && (
                <div className="profile-actions">
                  <button type="submit" className="btn btn-primary">
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>
        );

      case "orders": {
        const orderTabs = [
          { id: "all", label: "Tất cả" },
          { id: "pending", label: "Chờ thanh toán" },
          { id: "shipping", label: "Vận chuyển" },
          { id: "completed", label: "Hoàn thành" },
          { id: "cancelled", label: "Đã hủy" },
        ];

        const orderStatusMessages = {
          all: "Bạn chưa có đơn hàng nào.",
          pending: "Không có đơn hàng đang chờ thanh toán.",
          shipping: "Không có đơn hàng đang vận chuyển.",
          completed: "Bạn chưa có đơn hàng đã hoàn thành.",
          cancelled: "Bạn chưa có đơn hàng đã hủy.",
        };

        return (
          <div className="profile-card padding-box">
            <div className="order-header">
              <h2>Đơn mua</h2>
            </div>
            <div className="order-tabs-mock">
              {orderTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`order-tab-button ${orderFilter === tab.id ? "active" : ""}`}
                  onClick={() => setOrderFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="orders-content" key={orderFilter}>
              <div className="empty-state">
                <p>{orderStatusMessages[orderFilter]}</p>
              </div>
            </div>
          </div>
        );
      }

      case "wishlist":
        return (
          <div className="profile-card padding-box">
            <h2>Sản phẩm yêu thích</h2>
            <div className="empty-state">
              <p>Danh sách sản phẩm yêu thích của bạn đang trống.</p>
            </div>
          </div>
        );

      case "cart":
        return (
          <div className="profile-card padding-box">
            <h2>Giỏ hàng của bạn</h2>
            <div className="empty-state">
              <p>Giỏ hàng hiện tại chưa có sản phẩm nào.</p>
              <button className="btn btn-primary" onClick={() => navigate("/")}>Mua sắm ngay</button>
            </div>
          </div>
        );

      case "addresses":
        return (
          <div className="profile-card padding-box">
            <div className="flex-header">
              <h2>Địa chỉ giao hàng</h2>
              <button className="btn btn-secondary btn-sm">+ Thêm địa chỉ mới</button>
            </div>
            <div className="address-list">
              <div className="address-item default">
                <div className="address-badge">Mặc định</div>
                <p><strong>{user.fullName}</strong> | 0901234567</p>
                <p>Số 123 Đường ABC, Phường 5, Quận 1, TP. Hồ Chí Minh</p>
              </div>
              <div className="address-item">
                <p><strong>{user.fullName}</strong> | 0987654321</p>
                <p>Ký túc xá Đại học X, Đường Y, Thành phố Thủ Đức, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="profile-card padding-box">
            <h2>Đổi mật khẩu</h2>
            <form className="profile-form no-padding" onSubmit={(e) => e.preventDefault()}>
              <div className="profile-field">
                <label>Mật khẩu hiện tại</label>
                <input type="password" placeholder="Nhập mật khẩu cũ" />
              </div>
              <div className="profile-field">
                <label>Mật khẩu mới</label>
                <input type="password" placeholder="Nhập mật khẩu mới" />
              </div>
              <div className="profile-field">
                <label>Xác nhận mật khẩu mới</label>
                <input type="password" placeholder="Nhập lại mật khẩu mới" />
              </div>
              <button type="submit" className="btn btn-primary style-fit">Cập nhật mật khẩu</button>
            </form>
          </div>
        );

      case "privacy":
        return (
          <div className="profile-card padding-box">
            <h2>Thiết lập riêng tư</h2>
            <div className="privacy-section">
              <h3>Quản lý dữ liệu tài khoản</h3>
              <p className="profile-subtitle">
                Khi bạn yêu cầu xóa tài khoản, mọi thông tin cá nhân, lịch sử mua hàng và các dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </p>
              <div className="danger-zone">
                <h4>Vùng nguy hiểm</h4>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => alert("Hệ thống đã ghi nhận yêu cầu xóa tài khoản của bạn. Chúng tôi sẽ liên hệ xác nhận qua Email trong vòng 24h.")}
                >
                  Yêu cầu xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-layout-container">
          
          {/* SIDEBAR ĐIỀU HƯỚNG */}
          <aside className="profile-sidebar">
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">{user.fullName.slice(0, 1).toUpperCase()}</div>
              <div>
                <p className="sidebar-greet">Tài khoản của</p>
                <h3 className="sidebar-name">{user.fullName}</h3>
              </div>
            </div>
            
            <nav className="sidebar-menu">
              <button 
                className={`sidebar-link ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                Thông tin cá nhân
              </button>
              <button 
                className={`sidebar-link ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                Đơn mua của tôi
              </button>
              <button 
                className={`sidebar-link ${activeTab === "wishlist" ? "active" : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                Sản phẩm yêu thích
              </button>
              <button 
                className={`sidebar-link ${activeTab === "cart" ? "active" : ""}`}
                onClick={() => setActiveTab("cart")}
              >
                Giỏ hàng
              </button>
              <button 
                className={`sidebar-link ${activeTab === "addresses" ? "active" : ""}`}
                onClick={() => setActiveTab("addresses")}
              >
                Địa chỉ nhận hàng
              </button>
              <button 
                className={`sidebar-link ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Đổi mật khẩu
              </button>
              <button 
                className={`sidebar-link ${activeTab === "privacy" ? "active" : ""}`}
                onClick={() => setActiveTab("privacy")}
              >
                Thiết lập riêng tư
              </button>
            </nav>

            <hr className="sidebar-divider" />
            
            <button type="button" className="btn btn-secondary logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </aside>

          {/* KHU VỰC HIỂN THỊ NỘI DUNG CHỨC NĂNG */}
          <section className="profile-content-area">
            {renderContent()}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;