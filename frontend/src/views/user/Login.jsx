import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";

import "./Home.css";
import "./Auth.css";
import { GoogleLogin } from "@react-oauth/google";
function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const authUser = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      redirectAfterLogin(authUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập thất bại");
    }
  };
  const redirectAfterLogin = (authUser) => {
  if (authUser?.role === "ADMIN") {
    navigate("/dashboard");
  } else {
    navigate("/");
  }
};

const handleGoogleSuccess = async (credentialResponse) => {
  setError("");

  try {
    if (!credentialResponse?.credential) {
      setError("Không lấy được thông tin đăng nhập Google");
      return;
    }

    const authUser = await loginWithGoogle(credentialResponse.credential);
    redirectAfterLogin(authUser);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Đăng nhập bằng Google thất bại"
    );
  }
};
  return (
    <div className="home-page">
      <Header />

      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-intro">
            <p>Chào mừng trở lại</p>
            <h1>Đăng nhập tài khoản</h1>
            <span>
              Đăng nhập để quản lý giỏ hàng, đặt hàng và xem lịch sử mua sắm.
            </span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <label>
              Email
              <div className="auth-input">
                <Mail size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Mật khẩu
              <div className="auth-input">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>

            <div className="auth-extra">
              <label className="remember-me">
                <input type="checkbox" />
                Ghi nhớ đăng nhập
              </label>

              <a href="/">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <div className="google-login-box">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Đăng nhập bằng Google thất bại")}
                text="signin_with"
                shape="pill"
                width="320"
              />
            </div>

            <p className="auth-switch">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
