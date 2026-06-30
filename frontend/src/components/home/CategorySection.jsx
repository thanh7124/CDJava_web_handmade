import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "../common/SectionHeading";
import "./CategorySection.css";

const categoryImages = {
  "Phụ kiện":
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
  "Túi handmade":
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
  "Trang trí":
    "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80",
  "Quà tặng":
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  "Văn phòng":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80";

function CategorySection({ categories = [] }) {
  const trackRef = useRef(null);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;

    const scrollAmount = trackRef.current.clientWidth * 0.75;

    trackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="category-section" id="categories">
      <div className="category-section-top">
        <SectionHeading
          label=""
          title="Mua sắm theo sở thích của bạn"
        />

        {categories.length > 0 && (
          <div className="category-slider-actions">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Danh mục trước"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Danh mục sau"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {categories.length > 0 ? (
        <div className="category-carousel">
          <div className="category-carousel-track" ref={trackRef}>
            <Link to="/products" className="category-card category-card-all">
              <div>
                <h3>Tất cả sản phẩm</h3>
                <p>Khám phá toàn bộ sản phẩm handmade trong cửa hàng</p>
              </div>
            </Link>

            {categories.map((category) => (
              <Link
                to={`/products?categoryId=${category.id}`}
                className="category-card"
                key={category.id}
              >
                <img
                  src={categoryImages[category.name] || fallbackImage}
                  alt={category.name}
                />

                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description || "Khám phá sản phẩm"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="category-empty-card">Chưa có danh mục sản phẩm.</div>
      )}
    </section>
  );
}

export default CategorySection;