import { Search } from "lucide-react";
import AppButton from "../common/AppButton";
import useSearch from "../../hooks/useSearch";

function HeroSection() {
  const {
    searchValue,
    setSearchValue,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSubmit,
    handleSuggestionClick,
  } = useSearch();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <p className="hero-label">Sản phẩm thủ công độc đáo</p>

        <h1>Mỗi món đồ handmade là một câu chuyện nhỏ được làm bằng sự tỉ mỉ.</h1>

        <p className="hero-description">
          Khám phá các sản phẩm handmade tinh tế, phù hợp để trang trí, làm quà
          tặng hoặc sử dụng hằng ngày.
        </p>

        <div className="hero-search" style={{ position: 'relative' }}>
          <Search size={20} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
            <input
              type="text"
              placeholder="Tìm vòng tay, túi len, nến thơm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />
            <button type="submit">Tìm kiếm</button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '64px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(78, 48, 30, 0.12)',
              border: '1px solid #ead7c7',
              zIndex: 800,
              padding: '8px 0'
            }}>
              {suggestions.map((p) => (
                <div key={p.id} onClick={() => handleSuggestionClick(p.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fff4e9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <img src={p.image} alt={p.name} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#2f241d', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#a75f37', fontWeight: 700 }}>{p.price.toLocaleString('vi-VN')}₫</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hero-buttons">
          <AppButton href="#products">Mua sắm ngay</AppButton>

          <AppButton href="#categories" variant="secondary">
            Xem danh mục
          </AppButton>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=80"
          alt="Sản phẩm handmade"
        />

        <div className="hero-card">
          <strong>500+</strong>
          <span>Sản phẩm thủ công</span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;