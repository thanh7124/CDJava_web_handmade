import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SectionHeading from "../common/SectionHeading";
import ProductCard from "../product/ProductCard";

function ProductSection({ label, title, products, id }) {
  return (
    <section className="product-section" id={id}>
      <div className="product-section-top">
        <SectionHeading label={label} title={title} />

        <Link to="/products" className="view-all">
          Xem tất cả
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}

export default ProductSection;