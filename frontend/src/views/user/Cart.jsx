import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  Shield,
  Truck,
  RefreshCw,
  Minus,
  Plus,
  Tag,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/product.service';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Cart.css';
import './Home.css';

export default function Cart() {
  const {
    cartItems,
    totalItems,
    subtotal,
    totalSavings,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState(
    () => new Set(cartItems.map(item => item.productId))
  );
  const [couponCode, setCouponCode] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const allSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.productId)));
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleRemove = (productId) => {
    setRemovingId(productId);
    setTimeout(() => {
      removeFromCart(productId);
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setRemovingId(null);
    }, 300);
  };

  const handleClearCart = () => {
    clearCart();
    setSelectedItems(new Set());
  };

  return (
    <div className="home-page cart-page">
      <Header />

      {/* Breadcrumb */}
      <nav className="cart-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight />
        <span className="breadcrumb-current">Giỏ hàng</span>
      </nav>

      {/* Page Title */}
      <div className="cart-page-header">
        <h1>Giỏ hàng của bạn</h1>
        {totalItems > 0 && (
          <span className="cart-count-badge">{totalItems} sản phẩm</span>
        )}
      </div>

      {/* Main Content */}
      <div className="cart-layout">
        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={48} />
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm
              handmade độc đáo của chúng tôi!
            </p>
            <Link to="/" className="cart-empty-btn">
              <ArrowLeft size={18} />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items-section">
              {/* Select All Bar */}
              <div className="cart-select-bar">
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </label>
                <button
                  className="cart-clear-btn"
                  onClick={handleClearCart}
                  type="button"
                >
                  <Trash2 size={14} />
                  Xóa tất cả
                </button>
              </div>

              {/* Items List */}
              {cartItems.map((item, idx) => {
                const { product, quantity, productId } = item;
                const isRemoving = removingId === productId;

                return (
                  <div
                    key={productId}
                    className="cart-item-card"
                    style={{
                      animationDelay: `${idx * 0.05}s`,
                      opacity: isRemoving ? 0 : undefined,
                      transform: isRemoving ? 'translateX(-100%)' : undefined,
                      transition: isRemoving
                        ? 'opacity 0.3s, transform 0.3s'
                        : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <div className="cart-item-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(productId)}
                        onChange={() => handleSelectItem(productId)}
                      />
                    </div>

                    {/* Image */}
                    <div className="cart-item-image">
                      <img src={product.image} alt={product.name} />
                      {product.badge && (
                        <span className="cart-item-badge">{product.badge}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <div>
                          <h3 className="cart-item-name">
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </h3>
                          <span className="cart-item-category">
                            {product.category}
                          </span>
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => handleRemove(productId)}
                          title="Xóa sản phẩm"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-item-price">
                          <span className="cart-item-current-price">
                            {formatCurrency(product.price)}
                          </span>
                          {product.oldPrice && (
                            <>
                              <span className="cart-item-old-price">
                                {formatCurrency(product.oldPrice)}
                              </span>
                              <span className="cart-item-savings">
                                Tiết kiệm{' '}
                                {formatCurrency(
                                  (product.oldPrice - product.price) * quantity
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="cart-quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(productId, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            type="button"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="cart-qty-value">{quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(productId, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            type="button"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

                {/* Coupon Code */}
                <div className="cart-coupon-row">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className="cart-coupon-btn" type="button">
                    <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Áp dụng
                  </button>
                </div>

                {/* Price Lines */}
                <div className="cart-summary-lines">
                  <div className="cart-summary-line">
                    <span className="label">Tạm tính ({totalItems} sản phẩm)</span>
                    <span className="value">{formatCurrency(subtotal)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="cart-summary-line savings">
                      <span className="label">Tiết kiệm</span>
                      <span className="value">
                        -{formatCurrency(totalSavings)}
                      </span>
                    </div>
                  )}

                  <div className="cart-summary-line shipping">
                    <span className="label">Phí vận chuyển</span>
                    <span className="value">
                      {shippingFee === 0
                        ? 'Miễn phí'
                        : formatCurrency(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="cart-summary-total">
                  <span className="label">Tổng cộng</span>
                  <span className="value">{formatCurrency(total)}</span>
                </div>

                {shippingFee > 0 && (
                  <p
                    style={{
                      margin: '-14px 0 20px',
                      fontSize: 13,
                      color: '#27ae60',
                      fontWeight: 500,
                    }}
                  >
                    🚚 Mua thêm {formatCurrency(500000 - subtotal)} để được miễn
                    phí vận chuyển
                  </p>
                )}

                {/* Actions */}
                <Link to="/checkout" className="cart-checkout-btn">
                  <CreditCard size={20} />
                  Thanh toán ngay
                </Link>

                <Link to="/" className="cart-continue-btn">
                  <ArrowLeft size={16} />
                  Tiếp tục mua sắm
                </Link>

                {/* Trust badges */}
                <div className="cart-trust-badges">
                  <div className="cart-trust-item">
                    <div className="cart-trust-icon">
                      <Shield size={16} />
                    </div>
                    <span>Thanh toán an toàn & bảo mật 100%</span>
                  </div>
                  <div className="cart-trust-item">
                    <div className="cart-trust-icon">
                      <Truck size={16} />
                    </div>
                    <span>Giao hàng toàn quốc, miễn phí từ 500.000₫</span>
                  </div>
                  <div className="cart-trust-item">
                    <div className="cart-trust-icon">
                      <RefreshCw size={16} />
                    </div>
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
