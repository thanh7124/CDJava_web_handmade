import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchProductPage, formatCurrency } from '../../services/product.service';
import './ProductDetail.css';
import './Home.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductSection from '../../components/home/ProductSection';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);

        const productData = await fetchProductById(id);

        setProduct(productData);
        setQuantity(1);
        setActiveImage(0);

        const relatedResult = await fetchProductPage({
          categoryId: productData.categoryId,
          page: 1,
          limit: 4,
          sort: 'newest',
        });

        const related = (relatedResult.data || []).filter(
          (item) => item.id !== productData.id
        );

        setRelatedProducts(related);
      } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProductDetail();
    }
  }, [id]);

  const handleQuantityChange = (type) => {
    if (!product) return;

    if (type === 'decrease' && quantity > 1) {
      setQuantity((q) => q - 1);
    }

    if (type === 'increase' && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const mockReviews = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      rating: 5,
      date: '10/05/2026',
      comment: 'Sản phẩm rất đẹp, đóng gói cẩn thận. Giao hàng nhanh!',
    },
    {
      id: 2,
      user: 'Trần Thị B',
      rating: 4,
      date: '08/05/2026',
      comment: 'Màu sắc y như hình, chất liệu chắc chắn. Rất đáng tiền.',
    },
    {
      id: 3,
      user: 'Lê Hoàng C',
      rating: 5,
      date: '01/05/2026',
      comment: 'Rất ưng ý, thiết kế tối giản mà sang trọng.',
    },
  ];

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="loading-state">Đang tải thông tin sản phẩm...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="home-page">
        <Header />
        <div className="loading-state">
          <div>
            <p>Không tìm thấy sản phẩm.</p>
            <button type="button" onClick={() => navigate('/products')}>
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const categoryName = product.categoryName || product.category || 'Handmade';
  const rating = product.rating || 0;
  const sold = product.sold || 0;
  const stock = product.stock || 0;

  return (
    <div className="home-page">
      <Header />

      <div className="product-detail-container">
        <button
          type="button"
          className="back-product-btn"
          onClick={() => navigate('/products')}
        >
          ← Quay lại sản phẩm
        </button>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="main-image-container">
              <img
                src={images[activeImage] || product.image}
                alt={product.name}
                className="main-image"
              />
            </div>

            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, idx) => (
                  <button
                    type="button"
                    key={img}
                    className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-meta">
              <span className="product-category">{categoryName}</span>

              <div className="product-rating">
                <span className="stars">★★★★★</span>
                <span className="review-count">
                  ({rating} sao - Đã bán {sold})
                </span>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="price-container">
              <span className="product-price">
                {formatCurrency(product.price)}
              </span>

              {product.oldPrice && (
                <span className="product-old-price">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>

            {product.badge && (
              <span className="detail-badge">{product.badge}</span>
            )}

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <span className="quantity-label">Số lượng:</span>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>

                  <input type="number" value={quantity} readOnly />

                  <button
                    type="button"
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= stock}
                  >
                    +
                  </button>
                </div>

                <span className="stock-info">{stock} sản phẩm có sẵn</span>
              </div>

              <div className="action-buttons">
                <button type="button" className="btn-add-cart">
                  Thêm vào giỏ hàng
                </button>

                <button type="button" className="btn-buy-now">
                  Mua ngay
                </button>
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
                <span>Sản phẩm thủ công được chọn lọc kỹ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="product-more-info">
          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả chi tiết
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá & Nhận xét
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>Thông tin sản phẩm</h3>

                <p>{product.description}</p>

                <p>
                  Tất cả sản phẩm handmade tại cửa hàng đều được chế tác thủ công
                  với sự tỉ mỉ và tâm huyết. Sự khác biệt nhỏ về màu sắc hay
                  kích thước giữa các sản phẩm là minh chứng cho tính độc bản
                  của mỗi tác phẩm.
                </p>

                <ul>
                  <li>Chất liệu: Tự nhiên, thân thiện với môi trường</li>
                  <li>Thương hiệu: Handmade Shop</li>
                  <li>Xuất xứ: Việt Nam</li>
                  <li>Bảo quản: Nơi khô ráo, tránh ánh nắng trực tiếp</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="rating-big">
                    <h2>{rating}</h2>
                    <div className="stars">★★★★★</div>
                    <p>{product.reviews || 124} đánh giá</p>
                  </div>

                  <div className="rating-action">
                    <p>Bạn đã mua sản phẩm này?</p>
                    <button type="button" className="btn-write-review">
                      Viết đánh giá của bạn
                    </button>
                  </div>
                </div>

                <div className="reviews-list">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-avatar">
                          {review.user.charAt(0)}
                        </div>

                        <div className="reviewer-info">
                          <strong>{review.user}</strong>
                          <div className="stars">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>

                        <span className="review-date">{review.date}</span>
                      </div>

                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products-wrapper">
            <ProductSection
              label="Gợi ý cho bạn"
              title="Sản phẩm tương tự"
              products={relatedProducts}
              id="related-products"
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
  
}