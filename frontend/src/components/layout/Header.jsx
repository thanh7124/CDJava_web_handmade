import { Search, ShoppingBag, Heart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useOptionalCart } from "../../context/CartContext";

function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? 0;

  return (
    <header className="header">
      <Link to="/" className="logo">
        Handmade<span>Shop</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Trang chủ</Link>
        <a href="#products">Sản phẩm</a>
        <a href="#categories">Danh mục</a>
        <a href="#about">Về chúng tôi</a>
      </nav>

      <div className="nav-actions">
        <button type="button" aria-label="Tìm kiếm">
          <Search size={20} />
        </button>

        <button type="button" aria-label="Yêu thích">
          <Heart size={20} />
        </button>

        <Link
          to="/cart"
          className="nav-cart-link"
          aria-label="Giỏ hàng"
          style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '50%', background: '#f4e4d6', color: '#5b3a29', transition: '0.2s ease', textDecoration: 'none' }}
        >
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                background: '#a75f37',
                color: 'white',
                borderRadius: '50%',
                fontSize: 11,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                lineHeight: 1,
              }}
            >
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>

        <button type="button" aria-label="Tài khoản">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;