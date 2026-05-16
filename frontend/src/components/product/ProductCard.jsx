import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../services/product.service";

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span>{product.badge}</span>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3>{product.name}</h3>

        <div className="product-rating">
          <Star size={16} fill="currentColor" />
          <span>{product.rating}</span>
          <small>Đã bán {product.sold}</small>
        </div>

        <div className="product-price">
          <strong>{formatCurrency(product.price)}</strong>
          <del>{formatCurrency(product.oldPrice)}</del>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;