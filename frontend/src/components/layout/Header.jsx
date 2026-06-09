import { Search, ShoppingBag, Heart, User, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useOptionalCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { fetchCategories } from "../../services/product.service";
import "./Header.css";

function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? cart?.cartCount ?? 0;

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const accountRef = useRef(null);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [accountOpen, setAccountOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  const updateIndicator = () => {
    const navRoot = navLinksRef.current;
    if (!navRoot) return;

    const activeLink = navRoot.querySelector(".nav-link.active");

    if (!activeLink) {
      setIndicatorStyle({ left: 0, width: 0 });
      return;
    }

    const linkRect = activeLink.getBoundingClientRect();
    const navRect = navRoot.getBoundingClientRect();

    setIndicatorStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
    });
  };

  useEffect(() => {
    updateIndicator();

    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [location]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Lỗi tải danh mục header:", error);
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        Handmade<span>Shop</span>
      </Link>

      <nav className="nav-links" ref={navLinksRef}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Trang chủ
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Sản phẩm
        </NavLink>

        <div
          className={`nav-item categories ${showCategories ? "open" : ""}`}
          onMouseEnter={() => setShowCategories(true)}
          onMouseLeave={() => setShowCategories(false)}
        >
          <button
            type="button"
            className="nav-link categories-toggle"
            onClick={() => setShowCategories((state) => !state)}
            aria-haspopup="true"
            aria-expanded={showCategories}
          >
            Danh mục
          </button>

          <div className="categories-dropdown" role="menu">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  to={`/products?categoryId=${category.id}`}
                  key={category.id}
                  className="dropdown-item"
                  onClick={() => setShowCategories(false)}
                >
                  <span className="dropdown-name">{category.name}</span>
                  <span className="dropdown-count">Xem</span>
                </Link>
              ))
            ) : (
              <span className="dropdown-item">
                <span className="dropdown-name">Chưa có danh mục</span>
              </span>
            )}
          </div>
        </div>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Về chúng tôi
        </NavLink>

        <span
          className="nav-indicator"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </nav>

      <div className="nav-actions">
        <Link
          to="/?showSearch=1"
          aria-label="Tìm kiếm"
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "transparent",
            color: "#5b3a29",
            textDecoration: "none",
          }}
        >
          <Search size={20} />
        </Link>

        <button type="button" aria-label="Yêu thích">
          <Heart size={20} />
        </button>

        <Link
          to={isAuthenticated ? "/cart" : "/login"}
          className="nav-cart-link"
          aria-label="Giỏ hàng"
          title={isAuthenticated ? "Giỏ hàng" : "Đăng nhập để xem giỏ hàng"}
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#f4e4d6",
            color: "#5b3a29",
            transition: "0.2s ease",
            textDecoration: "none",
          }}
        >
          <ShoppingBag size={20} />

          {isAuthenticated && totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                background: "#a75f37",
                color: "white",
                borderRadius: "50%",
                fontSize: 11,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
              }}
            >
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>

        <div
          className={`account-menu ${accountOpen ? "open" : ""}`}
          ref={accountRef}
        >
          <button
            type="button"
            aria-label="Tài khoản"
            onClick={() => setAccountOpen(!accountOpen)}
          >
            <User size={20} />
          </button>

          <div className="account-dropdown">
            {isAuthenticated ? (
              <>
                <div className="account-info">
                  <strong>{user?.fullName}</strong>
                  <span>{user?.email}</span>
                </div>

                <Link
                  to="/profile"
                  className="account-dropdown-item"
                  onClick={() => setAccountOpen(false)}
                >
                  <User size={16} />
                  Trang cá nhân
                </Link>

                <button
                  type="button"
                  className="account-dropdown-item account-dropdown-logout"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="account-dropdown-item"
                  onClick={() => setAccountOpen(false)}
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="account-dropdown-item"
                  onClick={() => setAccountOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;