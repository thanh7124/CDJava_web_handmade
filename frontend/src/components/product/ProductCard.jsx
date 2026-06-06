import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../services/product.service";
import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "../../services/favorite.service";

function ProductCard({ product }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(product.id));
  }, [product.id]);

  const onToggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    setFav((s) => !s);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span>{product.badge}</span>

        <button
          className={fav ? "favorite-btn active" : "favorite-btn"}
          onClick={onToggleFav}
          aria-label={fav ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          <Heart size={18} />
        </button>
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