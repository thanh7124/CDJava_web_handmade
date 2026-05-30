import { Search, ShoppingBag, Heart, User, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useOptionalCart } from "../../context/CartContext";
import { useState, useEffect } from "react";
import { getAllProducts, formatCurrency } from "../../services/product.service";

function Header() {
  const cart = useOptionalCart();
  const totalItems = cart?.totalItems ?? 0;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQueryParam = searchParams.get("search") || "";

  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allProducts = getAllProducts() || [];

  // Đồng bộ hóa giá trị input với URL query parameter
  useEffect(() => {
    if (searchQueryParam) {
      setSearchValue(searchQueryParam);
      setShowSearch(true);
    } else {
      setSearchValue("");
      setShowSearch(false);
    }
  }, [searchQueryParam]);

  // Xử lý gợi ý tìm kiếm động khi gõ chữ
  useEffect(() => {
    if (searchValue.trim().length >= 1) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.category.toLowerCase().includes(searchValue.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchValue]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

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
        <div 
          className="search-container"
          onMouseEnter={() => setShowSearch(true)} 
          onMouseLeave={() => {
            // only hide suggestions on mouse leave; keep the search input
            setShowSuggestions(false);
          }}
          style={{ position: 'relative' }}
        >
          <div 
            className="search-wrapper"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              height: '40px',
              overflow: 'hidden',
              transition: 'width 0.3s ease',
              width: showSearch || searchValue ? '220px' : '40px',
              background: showSearch || searchValue ? '#f4e4d6' : 'transparent',
              borderRadius: '20px'
            }}
          >
            <form 
              onSubmit={handleSearchSubmit} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                height: '100%',
                padding: showSearch ? '0 12px' : '0'
              }}
            >
              {showSearch ? (
                <Search size={18} color="#5b3a29" style={{ minWidth: '18px', display: 'flex' }} />
              ) : (
                <button type="button" aria-label="Tìm kiếm" style={{ width: '40px', height: '40px', display: 'grid', placeItems: 'center' }}>
                  <Search size={20} />
                </button>
              )}
              
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                style={{ 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent', 
                  width: showSearch ? '100%' : '0',
                  opacity: showSearch ? 1 : 0,
                  color: '#5b3a29', 
                  fontSize: '14px',
                  marginLeft: showSearch ? '8px' : '0',
                  padding: '0',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
                autoFocus={showSearch}
              />
              {showSearch && (
                <button
                  type="button"
                  aria-label="Đóng tìm kiếm"
                  onClick={() => {
                    setSearchValue("");
                    setShowSuggestions(false);
                    setShowSearch(false);
                    navigate("/");
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#5b3a29',
                    display: 'grid',
                    placeItems: 'center',
                    width: 32,
                    height: 32,
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* Gợi ý tìm kiếm (Search Suggestions) */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="search-suggestions" 
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '280px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(78, 48, 30, 0.12)',
                border: '1px solid #ead7c7',
                zIndex: 1000,
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 600, color: '#a75f37', textTransform: 'uppercase', borderBottom: '1px solid #f4e4d6', paddingBottom: '6px', marginBottom: '6px' }}>
                Gợi ý sản phẩm
              </div>
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff4e9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #f4e4d6' }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#2f241d', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#a75f37', fontWeight: 700 }}>
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              ))}
              <div 
                onClick={() => handleSearchSubmit()}
                style={{
                  padding: '10px 16px 4px',
                  fontSize: '12px',
                  color: '#5b3a29',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderTop: '1px solid #f4e4d6',
                  marginTop: '6px',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#a75f37'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#5b3a29'}
              >
                Xem tất cả kết quả cho "{searchValue}"
              </div>
            </div>
          )}
        </div>

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