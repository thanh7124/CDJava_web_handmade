import { Search, ShoppingBag, Heart, User, X } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useOptionalCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { getAllProducts, formatCurrency, getProductCategories } from "../../services/product.service";

function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? 0;

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });


  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const allProducts = getAllProducts() || [];
  const categories = getProductCategories().filter((c) => c !== "Tất cả");
  const [showCategories, setShowCategories] = useState(false);

  const updateIndicator = () => {
    const navRoot = navLinksRef.current;
    if (!navRoot) return;

    const activeLink = navRoot.querySelector('.nav-link.active');
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
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location]);


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
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Trang chủ</NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Sản phẩm</NavLink>

        <div
          className={`nav-item categories ${showCategories ? "open" : ""}`}
          onMouseEnter={() => setShowCategories(true)}
          onMouseLeave={() => setShowCategories(false)}
        >
          <button
            type="button"
            className="nav-link categories-toggle"
            onClick={() => setShowCategories((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showCategories}
          >
            Danh mục
          </button>

          <div className="categories-dropdown" role="menu">
            {categories.map((cat) => {
              const count = allProducts.filter((p) => p.category === cat).length;

              return (
                <Link
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  key={cat}
                  className="dropdown-item"
                >
                  <span className="dropdown-name">{cat}</span>
                  <span className="dropdown-count">{count} sp</span>
                </Link>
              );
            })}
          </div>
        </div>

        <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Về chúng tôi</NavLink>
        <span className="nav-indicator" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
      </nav>

      <div className="nav-actions">
        <Link to="/?showSearch=1" aria-label="Tìm kiếm" style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '50%', background: 'transparent', color: '#5b3a29', textDecoration: 'none' }}>
          <Search size={20} />
        </Link>

        <button type="button" aria-label="Yêu thích">
          <Heart size={20} />
        </button>

        <Link
          to="/cart"
          className="nav-cart-link"
          aria-label="Giỏ hàng"
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

          {totalItems > 0 && (
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

        <div className={`account-menu ${accountOpen ? "open" : ""}`} ref={accountRef}>
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
                  className="account-dropdown-item primary"
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