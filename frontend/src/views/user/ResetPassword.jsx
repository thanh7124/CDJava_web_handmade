import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { resetPasswordApi } from "../../services/auth.service";
import Header from "../../components/layout/Header";
import "./PasswordRecovery.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi({
        token,
        newPassword,
      });

      setMessage("Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể đặt lại mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="password-page">
        <section className="password-card">
          <div className="password-info">
            <span className="password-eyebrow">Bảo mật tài khoản</span>
            <h1>Đặt mật khẩu mới</h1>
            <p>
              Nhập mật khẩu mới cho tài khoản của bạn. Sau khi cập nhật thành
              công, liên kết sẽ không còn hiệu lực.
            </p>
          </div>

          <form className="password-form" onSubmit={handleSubmit}>
            <Link to="/login" className="password-back-link">
              <ArrowLeft size={18} />
              Quay lại đăng nhập
            </Link>

            <div className="password-form-heading">
              <h2>Mật khẩu mới</h2>
              <p>Vui lòng đặt mật khẩu từ 6 ký tự trở lên.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <label className="password-field">
              <span>Mật khẩu mới</span>
              <div className="password-input">
                <Lock size={20} />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="password-field">
              <span>Xác nhận mật khẩu</span>
              <div className="password-input">
                <Lock size={20} />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="password-submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}