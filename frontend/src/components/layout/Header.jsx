import { Search, ShoppingBag, Heart, User } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Handmade<span>Shop</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/products">Sản phẩm</Link>
        <a href="/#categories">Danh mục</a>
        <a href="/#about">Về chúng tôi</a>
      </nav>

      <div className="nav-actions">
        <button type="button" aria-label="Tìm kiếm">
          <Search size={20} />
        </button>

        <button type="button" aria-label="Yêu thích">
          <Heart size={20} />
        </button>

        <button type="button" aria-label="Giỏ hàng">
          <ShoppingBag size={20} />
        </button>

        <button type="button" aria-label="Tài khoản">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;