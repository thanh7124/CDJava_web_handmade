import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import "./Profile.css";

function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
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

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <section className="profile-panel">
          <div className="profile-top">
            <div>
              <p className="profile-badge">Hồ sơ cá nhân</p>
              <h1>Xin chào, {user.fullName}</h1>
              <p className="profile-subtitle">
                Quản lý thông tin tài khoản và cập nhật email hoặc tên hiển thị của bạn.
              </p>
            </div>
            <button
              type="button"
              className={editMode ? "btn btn-secondary" : "btn btn-primary"}
              onClick={() => {
                setMessage(null);
                setEditMode((prev) => !prev);
              }}
            >
              {editMode ? "Hủy" : "Chỉnh sửa"}
            </button>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-avatar">{user.fullName.slice(0, 1).toUpperCase()}</div>
              <div>
                <h2>{user.fullName}</h2>
                <span className="profile-role">Vai trò: {user.role || "Người dùng"}</span>
              </div>
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

          <div className="profile-extra">
            <div className="profile-extra-card">
              <h3>Chúng tôi bảo mật thông tin của bạn</h3>
              <p>
                Mọi dữ liệu cá nhân sẽ được lưu trữ an toàn. Bạn có thể thay đổi thông tin cơ bản bất cứ lúc nào.
              </p>
            </div>

            <button type="button" className="btn btn-secondary logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
