import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { useOptionalCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { fetchCategories, fetchProductPage } from "../../services/product.service";
import "./Header.css";


function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? cart?.cartCount ?? 0;

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [accountOpen, setAccountOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggest(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchKey.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const result = await fetchProductPage({
          search: searchKey.trim(),
          page: 1,
          limit: 5,
          sort: "newest",
        });

        setSuggestions(result?.data || []);
      } catch (error) {
        console.error("Lỗi lấy gợi ý tìm kiếm trên header:", error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchKey]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    if (!query) setSearchKey("");
  }, [location]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (!searchKey.trim()) return;

    setShowSuggest(false);
    navigate(`/?search=${encodeURIComponent(searchKey.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="Handmade Shop - Trang chủ">
          <span className="logo-wordmark">
            <span className="logo-wordmark-main">Handmade</span>
            <span className="logo-wordmark-accent">Shop</span>
          </span>
        </Link>

        <nav className="nav-links" ref={navLinksRef}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Trang chủ
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
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
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Về chúng tôi
          </NavLink>

          <span
            className="nav-indicator"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </nav>

        <div className="nav-actions">
          <div className="header-search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="header-search-form" role="search">

              <input
                type="text"
                placeholder="Tìm sản phẩm handmade..."
                value={searchKey}
                onChange={(event) => {
                  setSearchKey(event.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
              />

              <button type="submit" className="header_search_btn" aria-label="Tìm kiếm">
                <Search size={16} />
              </button>
            </form>

            {showSuggest && searchKey.trim() && (
              <div className="search-suggestions-dropdown">
                {searchLoading ? (
                  <div className="suggestion-state">Đang tìm kiếm...</div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="suggestion-title">Sản phẩm gợi ý</div>
                    {suggestions.map((product) => (
                      <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        className="suggestion-item"
                        onClick={() => setShowSuggest(false)}
                      >
                        {product.image && (
                          <img src={product.image} alt={product.name} className="suggestion-img" />
                        )}
                        <div className="suggestion-info">
                          <span className="suggestion-name">{product.name}</span>
                          <span className="suggestion-price">
                            {product.price?.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </Link>
                    ))}
                    <button type="button" className="suggestion-footer" onClick={handleSearchSubmit}>
                      Xem tất cả kết quả cho "{searchKey}"
                    </button>
                  </>
                ) : (
                  <div className="suggestion-state">Không tìm thấy sản phẩm nào</div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="icon-action-btn"
            aria-label="Yêu thích"
            onClick={() => {
              if (isAuthenticated) {
                navigate("/profile", { state: { activeTab: "wishlist" } });
              } else {
                navigate("/login");
              }
            }}
          >
            <Heart size={20} />
          </button>

          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            className="icon-action-btn nav-cart-link"
            aria-label="Giỏ hàng"
            title={isAuthenticated ? "Giỏ hàng" : "Đăng nhập để xem giỏ hàng"}
          >
            <ShoppingBag size={20} />
            {isAuthenticated && totalItems > 0 && (
              <span className="cart-badge">{totalItems > 9 ? "9+" : totalItems}</span>
            )}
          </Link>

          <div className={`account-menu ${accountOpen ? "open" : ""}`} ref={accountRef}>
            <button
              type="button"
              className="icon-action-btn"
              aria-label="Tài khoản"
              onClick={() => setAccountOpen((state) => !state)}
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
                    className="account-dropdown-item header_logout_btn"
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
      </div>
    </header>
  );
}

export default Header;
