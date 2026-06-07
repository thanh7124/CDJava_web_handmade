import React, { useEffect, useMemo, useState } from 'react';
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
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState(
    () => new Set(cartItems.map((item) => item.id))
  );
  const [couponCode, setCouponCode] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    setSelectedItems((prev) => {
      const currentIds = cartItems.map((item) => item.id);
      const next = new Set();

      currentIds.forEach((id) => {
        if (prev.has(id)) {
          next.add(id);
        }
      });

      cartItems.forEach((item) => {
        if (!prev.has(item.id)) {
          next.add(item.id);
        }
      });

      return next;
    });
  }, [cartItems]);

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => selectedItems.has(item.id));
  }, [cartItems, selectedItems]);

  const selectedTotalItems = useMemo(() => {
    return selectedCartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }, [selectedCartItems]);

  const subtotal = useMemo(() => {
    return selectedCartItems.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [selectedCartItems]);

  const totalSavings = useMemo(() => {
    return selectedCartItems.reduce((total, item) => {
      if (!item.oldPrice) return total;

      return (
        total +
        (Number(item.oldPrice) - Number(item.price || 0)) *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [selectedCartItems]);

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const allSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems((prev) => {
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

      setSelectedItems((prev) => {
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

      <nav className="cart-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight />
        <span className="breadcrumb-current">Giỏ hàng</span>
      </nav>

      <div className="cart-page-header">
        <h1>Giỏ hàng của bạn</h1>

        {totalItems > 0 && (
          <span className="cart-count-badge">{totalItems} sản phẩm</span>
        )}
      </div>

      <div className="cart-layout">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={48} />
            </div>

            <h2>Giỏ hàng trống</h2>

            <p>
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm
              handmade độc đáo của chúng tôi!
            </p>

            <Link to="/products" className="cart-empty-btn">
              <ArrowLeft size={18} />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items-section">
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

              {cartItems.map((item, idx) => {
                const isRemoving = removingId === item.id;

                return (
                  <div
                    key={item.id}
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
                    <div className="cart-item-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </div>

                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />

                      {item.badge && (
                        <span className="cart-item-badge">{item.badge}</span>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <div>
                          <h3 className="cart-item-name">
                            <Link to={`/products/${item.id}`}>
                              {item.name}
                            </Link>
                          </h3>

                          <span className="cart-item-category">
                            {item.categoryName || 'Handmade'}
                          </span>
                        </div>

                        <button
                          className="cart-item-remove"
                          onClick={() => handleRemove(item.id)}
                          title="Xóa sản phẩm"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-item-price">
                          <span className="cart-item-current-price">
                            {formatCurrency(item.price)}
                          </span>

                          {item.oldPrice && (
                            <>
                              <span className="cart-item-old-price">
                                {formatCurrency(item.oldPrice)}
                              </span>

                              <span className="cart-item-savings">
                                Tiết kiệm{' '}
                                {formatCurrency(
                                  (Number(item.oldPrice) - Number(item.price)) *
                                    Number(item.quantity)
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="cart-quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            type="button"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="cart-qty-value">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.stock && item.quantity >= item.stock}
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

            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

                <div className="cart-coupon-row">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />

                  <button className="cart-coupon-btn" type="button">
                    <Tag
                      size={14}
                      style={{
                        display: 'inline',
                        verticalAlign: 'middle',
                        marginRight: 4,
                      }}
                    />
                    Áp dụng
                  </button>
                </div>

                <div className="cart-summary-lines">
                  <div className="cart-summary-line">
                    <span className="label">
                      Tạm tính ({selectedTotalItems} sản phẩm)
                    </span>

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

                {selectedTotalItems > 0 ? (
                  <Link to="/checkout" className="cart-checkout-btn">
                    <CreditCard size={20} />
                    Thanh toán ngay
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="cart-checkout-btn"
                    disabled
                    style={{
                      opacity: 0.55,
                      cursor: 'not-allowed',
                    }}
                  >
                    <CreditCard size={20} />
                    Chọn sản phẩm để thanh toán
                  </button>
                )}

                <Link to="/products" className="cart-continue-btn">
                  <ArrowLeft size={16} />
                  Tiếp tục mua sắm
                </Link>

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