import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, formatCurrency } from '../../services/product.service';
import './ProductDetail.css';
import './Home.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Trong ứng dụng thực tế, đây sẽ là lệnh gọi API
    const fetchedProduct = getProductById(id || 1); // Fallback to 1 if no id for demo
    if (fetchedProduct) {
      setProduct(fetchedProduct);
    } else {
      // Optional: navigate to 404 or home if not found
      // navigate('/');
    }
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="home-page">
        <Header />
        <div className="loading-state">Đang tải thông tin sản phẩm...</div>
        <Footer />
      </div>
    );
  }

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(q => q - 1);
    } else if (type === 'increase' && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  return (
    <div className="home-page">
      <Header />
      <div className="product-detail-container">
        <div className="product-detail-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img
                src={product.images ? product.images[activeImage] : product.image}
                alt={product.name}
                className="main-image"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-meta">
              <span className="product-category">{product.category}</span>
              <div className="product-rating">
                <span className="stars">★★★★★</span>
                <span className="review-count">({product.rating} sao - Đã bán {product.sold})</span>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>
            <div className="price-container">
              <span className="product-price">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="product-old-price">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button onClick={() => handleQuantityChange('increase')} disabled={quantity >= product.stock}>+</button>
                </div>
                <span className="stock-info">{product.stock} sản phẩm có sẵn</span>
              </div>

              <div className="action-buttons">
                <button className="btn-add-cart">Thêm vào giỏ hàng</button>
                <button className="btn-buy-now">Mua ngay</button>
              </div>
            </div>

            <div className="product-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="feature">
                <span className="feature-icon">↩️</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💎</span>
                <span>Cam kết chính hãng 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
