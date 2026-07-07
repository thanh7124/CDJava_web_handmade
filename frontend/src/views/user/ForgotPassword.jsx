import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordApi } from "../../services/auth.service";
import Header from "../../components/layout/Header";
import "./PasswordRecovery.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await forgotPasswordApi(email);

      setMessage(
        "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi yêu cầu đặt lại mật khẩu"
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
            <span className="password-eyebrow">Khôi phục tài khoản</span>
            <h1>Quên mật khẩu?</h1>
            <p>
              Nhập email đã đăng ký. Hệ thống sẽ gửi liên kết đặt lại mật khẩu
              đến Gmail của bạn.
            </p>
          </div>

          <form className="password-form" onSubmit={handleSubmit}>
            <Link to="/login" className="password-back-link">
              <ArrowLeft size={18} />
              Quay lại đăng nhập
            </Link>

            <div className="password-form-heading">
              <h2>Lấy lại mật khẩu</h2>
              <p>Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <label className="password-field">
              <span>Email</span>
              <div className="password-input">
                <Mail size={20} />
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="password-submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}   