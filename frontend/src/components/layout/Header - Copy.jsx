import { Search, ShoppingBag, Heart, User } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useOptionalCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { fetchCategories, fetchProductPage } from "../../services/product.service"; // Thêm fetchProductPage vào đây
import "./Header.css";

function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? cart?.cartCount ?? 0;

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const accountRef = useRef(null);
  const searchRef = useRef(null); // Ref phục vụ đóng mở thanh tìm kiếm khi click out

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [accountOpen, setAccountOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  // Các State xử lý tìm kiếm gợi ý
  const [searchKey, setSearchKey] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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

  // Xử lý click ra ngoài để ẩn Dropdown Tài khoản & Dropdown Tìm kiếm gợi ý
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggest(false);
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Kỹ thuật Debounce để gọi API lấy sản phẩm gợi ý
  useEffect(() => {
    if (!searchKey.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchLoading(true);
        // Gọi API fetch danh sách sản phẩm khớp với từ khóa (giới hạn 5 phần tử hiển thị nhanh)
        const result = await fetchProductPage({
          search: searchKey.trim(),
          page: 1,
          limit: 5,
          sort: "newest",
        });
        // Đồng bộ cấu trúc normalize giống trang Home (lấy mảng nằm trong trường data)
        setSuggestions(result?.data || []);
      } catch (error) {
        console.error("Lỗi lấy gợi ý tìm kiếm trên header:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // Chờ người dùng dừng gõ 300ms rồi mới kích hoạt gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [searchKey]);

  // Đồng bộ xóa từ khóa tìm kiếm trên ô nhập khi URL thay đổi (Ví dụ người dùng xóa trên URL hoặc chuyển trang)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    if (!query) {
      setSearchKey("");
    }
  }, [location]);

  // Xử lý khi nhấn Enter hoặc bấm icon kính lúp
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKey.trim()) {
      setShowSuggest(false);
      setIsSearchExpanded(false);
      // Điều hướng về trang chủ kèm param query tương tự logic tìm kiếm hiện tại của trang Home
      navigate(`/?search=${encodeURIComponent(searchKey.trim())}`);
    }
  };

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
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
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
        {/* THANH TÌM KIẾM MỚI THAY THẾ CHO NÚT LINK CŨ */}
        <div className="header-search-container" ref={searchRef}>
          {!isSearchExpanded ? (
            <button
              type="button"
              className="nav-action-btn"
              aria-label="Tìm kiếm"
              onClick={() => setIsSearchExpanded(true)}
            >
              <Search size={20} />
            </button>
          ) : (
            <form onSubmit={handleSearchSubmit} className="header-search-form expanded">
              <input
                type="text"
                placeholder="Tìm sản phẩm handmade..."
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                autoFocus
              />
              <button type="submit" aria-label="Tìm kiếm">
                <Search size={15} />
              </button>
            </form>
          )}

          {/* Hộp xổ xuống hiển thị đề xuất/gợi ý sản phẩm nhanh */}
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
                  <div className="suggestion-footer" onClick={handleSearchSubmit}>
                    Xem tất cả kết quả cho "{searchKey}"
                  </div>
                </>
              ) : (
                <div className="suggestion-state">Không tìm thấy sản phẩm nào</div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
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

        <div className={`account-menu ${accountOpen ? "open" : ""}`} ref={accountRef}>
          <button type="button" aria-label="Tài khoản" onClick={() => setAccountOpen(!accountOpen)}>
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
                <Link to="/login" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                  Đăng nhập
                </Link>

                <Link to="/register" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
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