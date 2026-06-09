import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SectionHeading from "../common/SectionHeading";
import ProductCard from "../product/ProductCard";
import "./ProductSection.css";

function ProductSection({
  label,
  title,
  products = [],
  id,
  viewTo = "/products",
}) {
  return (
    <section className="product-section" id={id}>
      <div className="product-section-top">
        <SectionHeading label={label} title={title} />

        <Link to={viewTo} className="view-all">
          Xem tất cả
          <ArrowRight size={18} />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              product={{
                ...product,
                category: product.categoryName || product.category,
              }}
              key={product.id}
            />
          ))}
        </div>
      ) : (
        <div className="product-section-empty">
          Chưa có sản phẩm để hiển thị.
        </div>
      )}
    </section>
  );
}

export default ProductSection;