import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductSection from '../../components/home/ProductSection';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { useOptionalAuth } from '../../context/AuthContext';
import {
  fetchProductById,
  fetchProductPage,
  formatCurrency,
} from '../../services/product.service';
import {
  createReview,
  getReviewsByProduct,
  getReviewSummary,
} from '../../services/reviewService';
import './ProductDetail.css';

const FALLBACK_IMAGE = 'https://placehold.co/800x800?text=Handmade+Product';

function normalizeReviews(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function normalizeSummary(payload) {
  const data = payload?.data || payload || {};

  return {
    averageRating: Number(data.averageRating || data.average || 0),
    totalReviews: Number(data.totalReviews || data.total || data.count || 0),
  };
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error?.message) return error.message;

  return fallback;
}

function renderStars(value) {
  const count = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function formatDate(dateValue) {
  if (!dateValue) return '';

  try {
    return new Date(dateValue).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();
  const auth = useOptionalAuth();

  const token = auth?.user?.token || auth?.token || '';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });

  const productId = product?.id || id;

  const images = useMemo(() => {
    const productImages = Array.isArray(product?.images) ? product.images : [];
    const allImages = [...productImages, product?.image].filter(Boolean);
    return allImages.length > 0 ? allImages : [FALLBACK_IMAGE];
  }, [product]);

  const categoryName = product?.categoryName || product?.category || 'Handmade';
  const stock = Number(product?.stock ?? product?.stockQuantity ?? 0);
  const sold = Number(product?.sold || 0);
  const isOutOfStock = stock <= 0;
  const fav = product?.id ? isFavorite(product.id) : false;

  async function loadReviews(targetProductId) {
    if (!targetProductId) return;

    try {
      setReviewLoading(true);

      const [reviewsResult, summaryResult] = await Promise.all([
        getReviewsByProduct(targetProductId),
        getReviewSummary(targetProductId),
      ]);

      setReviews(normalizeReviews(reviewsResult));
      setReviewSummary(normalizeSummary(summaryResult));
    } catch (error) {
      console.error('Lỗi tải đánh giá sản phẩm:', error);
      setReviews([]);
      setReviewSummary({ averageRating: 0, totalReviews: 0 });
    } finally {
      setReviewLoading(false);
    }
  }

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        setCartMessage('');
        setReviewMessage('');

        const productData = await fetchProductById(id);

        setProduct(productData);
        setQuantity(1);
        setActiveImage(0);
        setActiveTab('description');

        await loadReviews(productData.id);

        if (productData.categoryId) {
          const relatedResult = await fetchProductPage({
            categoryId: productData.categoryId,
            page: 1,
            limit: 5,
            sort: 'newest',
          });

          const related = (relatedResult.data || relatedResult.content || [])
            .filter((item) => item.id !== productData.id)
            .slice(0, 4);

          setRelatedProducts(related);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProductDetail();
    }
  }, [id]);

  function handleQuantityChange(type) {
    if (!product || isOutOfStock) return;

    if (type === 'decrease' && quantity > 1) {
      setQuantity((current) => current - 1);
    }

    if (type === 'increase' && quantity < stock) {
      setQuantity((current) => current + 1);
    }
  }

  async function handleAddToCart() {
    if (!product || isOutOfStock) return;

    try {
      await addToCart(product, quantity);
      setCartMessage('Đã thêm sản phẩm vào giỏ hàng');
      setTimeout(() => setCartMessage(''), 1800);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Không thể thêm sản phẩm vào giỏ hàng';

      setCartMessage(message);

      if (message.toLowerCase().includes('đăng nhập')) {
        setTimeout(() => navigate('/login'), 900);
      }

      setTimeout(() => setCartMessage(''), 2200);
    }
  }

  async function handleBuyNow() {
    if (!product || isOutOfStock) return;

    try {
      await addToCart(product, quantity);
      navigate('/cart');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Không thể mua sản phẩm lúc này';

      setCartMessage(message);

      if (message.toLowerCase().includes('đăng nhập')) {
        setTimeout(() => navigate('/login'), 900);
      }
    }
  }

  async function handleSubmitReview(event) {
    event.preventDefault();
    setReviewMessage('');

    if (!token) {
      setReviewMessage('Bạn cần đăng nhập để đánh giá sản phẩm.');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewMessage('Vui lòng nhập nội dung nhận xét.');
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewMessage('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    try {
      setReviewSubmitting(true);

      await createReview(
        productId,
        {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        },
        token
      );

      setReviewForm({ rating: 5, comment: '' });
      setReviewMessage('Gửi đánh giá thành công.');

      await loadReviews(productId);
    } catch (error) {
      setReviewMessage(
        getErrorMessage(error, 'Không thể gửi đánh giá. Vui lòng thử lại sau.')
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <main className="loading-state">Đang tải thông tin sản phẩm...</main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Header />
        <main className="loading-state not-found-state">
          <p>Không tìm thấy sản phẩm.</p>
          <button type="button" onClick={() => navigate('/products')}>
            Quay lại danh sách sản phẩm
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Header />

      <main className="product-detail-container">
        <button
          type="button"
          className="back-product-btn"
          onClick={() => navigate('/products')}
        >
          ← Quay lại sản phẩm
        </button>

        <section className="product-detail-grid">
          <div className="product-gallery">
            <div className="main-image-container">
              <img
                src={images[activeImage] || FALLBACK_IMAGE}
                alt={product.name}
                className="main-image"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <button
                    type="button"
                    key={`${img}-${index}`}
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-meta">
              <span className="product-category">{categoryName}</span>

              <div className="product-rating">
                <span className="stars">{renderStars(reviewSummary.averageRating)}</span>
                <span className="review-count">
                  {reviewSummary.averageRating || 0}/5 · {reviewSummary.totalReviews || 0} nhận xét
                  {sold > 0 ? ` · Đã bán ${sold}` : ''}
                </span>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="price-container">
              <span className="product-price">{formatCurrency(product.price)}</span>

              {product.oldPrice && (
                <span className="product-old-price">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>

            {product.badge && <span className="detail-badge">{product.badge}</span>}

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <span className="quantity-label">Số lượng:</span>

                <div className="quantity-row">
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      -
                    </button>

                    <input type="number" value={isOutOfStock ? 0 : quantity} readOnly />

                    <button
                      type="button"
                      onClick={() => handleQuantityChange('increase')}
                      disabled={quantity >= stock || isOutOfStock}
                    >
                      +
                    </button>
                  </div>

                  <span className={`stock-info ${isOutOfStock ? 'out-of-stock' : ''}`}>
                    {isOutOfStock ? 'Hết hàng' : `${stock} sản phẩm có sẵn`}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  type="button"
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  Mua ngay
                </button>

                <button
                  type="button"
                  className={`btn-favorite ${fav ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                  title={fav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart size={24} fill={fav ? 'currentColor' : 'none'} />
                </button>
              </div>

              {cartMessage && <p className="cart-message">{cartMessage}</p>}
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
        </section>

        <section className="product-more-info">
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
                  kích thước giữa các sản phẩm là minh chứng cho tính độc bản của
                  mỗi tác phẩm.
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
                    <h2>{reviewSummary.averageRating || 0}</h2>
                    <div className="stars">{renderStars(reviewSummary.averageRating)}</div>
                    <p>{reviewSummary.totalReviews || 0} nhận xét</p>
                  </div>

                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <p>Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá.</p>

                    <label>
                      Số sao
                      <select
                        value={reviewForm.rating}
                        onChange={(event) => setReviewForm((current) => ({
                          ...current,
                          rating: Number(event.target.value),
                        }))}
                      >
                        <option value={5}>5 sao</option>
                        <option value={4}>4 sao</option>
                        <option value={3}>3 sao</option>
                        <option value={2}>2 sao</option>
                        <option value={1}>1 sao</option>
                      </select>
                    </label>

                    <textarea
                      value={reviewForm.comment}
                      onChange={(event) => setReviewForm((current) => ({
                        ...current,
                        comment: event.target.value,
                      }))}
                      placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                      rows={4}
                    />

                    <button type="submit" disabled={reviewSubmitting}>
                      {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>

                    {reviewMessage && (
                      <span className="review-message">{reviewMessage}</span>
                    )}
                  </form>
                </div>

                {reviewLoading ? (
                  <p className="review-empty">Đang tải nhận xét...</p>
                ) : reviews.length === 0 ? (
                  <p className="review-empty">Chưa có nhận xét nào cho sản phẩm này.</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <article key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-avatar">
                            {(review.userName || 'N').charAt(0).toUpperCase()}
                          </div>

                          <div className="reviewer-info">
                            <strong>{review.userName || 'Người dùng'}</strong>
                            <div className="stars">{renderStars(review.rating)}</div>
                          </div>

                          <span className="review-date">
                            {formatDate(review.createdDate)}
                          </span>
                        </div>

                        <p className="review-text">{review.comment}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products-wrapper">
            <ProductSection
              label="Gợi ý cho bạn"
              title="Sản phẩm tương tự"
              products={relatedProducts}
              id="related-products"
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}