import { Search } from "lucide-react";
import AppButton from "../common/AppButton";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <p className="hero-label">Sản phẩm thủ công độc đáo</p>

        <h1>Mỗi món đồ handmade là một câu chuyện nhỏ được làm bằng sự tỉ mỉ.</h1>

        <p className="hero-description">
          Khám phá các sản phẩm handmade tinh tế, phù hợp để trang trí, làm quà
          tặng hoặc sử dụng hằng ngày.
        </p>

        <div className="hero-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm vòng tay, túi len, nến thơm..."
          />
          <button type="button">Tìm kiếm</button>
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