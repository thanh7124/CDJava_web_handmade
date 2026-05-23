import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/product.service';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, subtotal, totalSavings, clearCart } = useCart();
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const validate = () => {
    const nextErrors = {};
    if (!billingInfo.fullName.trim()) {
      nextErrors.fullName = 'Nhập họ tên người nhận';
    }
    if (!billingInfo.phone.trim()) {
      nextErrors.phone = 'Nhập số điện thoại';
    }
    if (!billingInfo.address.trim()) {
      nextErrors.address = 'Nhập địa chỉ giao hàng';
    }
    if (!billingInfo.city.trim()) {
      nextErrors.city = 'Nhập thành phố / tỉnh';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    if (!validate()) return;

    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="checkout-confirmation">
          <h1>Đặt hàng thành công!</h1>
          <p>
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý và sẽ được
            giao sớm nhất có thể.
          </p>
          <Link to="/" className="checkout-back-btn">
            Quay về trang chủ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />

      <div className="checkout-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span> / </span>
        <Link to="/cart">Giỏ hàng</Link>
        <span> / </span>
        <span className="breadcrumb-current">Thanh toán</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-card">
          <div className="checkout-section-header">
            <h2>Thông tin giao hàng</h2>
            <p>Nhập thông tin để chúng tôi giao hàng nhanh chóng và chính xác.</p>
          </div>

          <div className="checkout-grid">
            <label className="checkout-field">
              <span>Họ và tên</span>
              <input
                type="text"
                name="fullName"
                value={billingInfo.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <small>{errors.fullName}</small>}
            </label>

            <label className="checkout-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={billingInfo.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
            </label>

            <label className="checkout-field">
              <span>Điện thoại</span>
              <input
                type="tel"
                name="phone"
                value={billingInfo.phone}
                onChange={handleChange}
                placeholder="0901234567"
              />
              {errors.phone && <small>{errors.phone}</small>}
            </label>

            <label className="checkout-field checkout-field-full">
              <span>Địa chỉ</span>
              <input
                type="text"
                name="address"
                value={billingInfo.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, phường/xã"
              />
              {errors.address && <small>{errors.address}</small>}
            </label>

            <label className="checkout-field">
              <span>Thành phố / Tỉnh</span>
              <input
                type="text"
                name="city"
                value={billingInfo.city}
                onChange={handleChange}
                placeholder="Hà Nội"
              />
              {errors.city && <small>{errors.city}</small>}
            </label>

            <label className="checkout-field checkout-field-full">
              <span>Ghi chú đơn hàng</span>
              <textarea
                name="note"
                value={billingInfo.note}
                onChange={handleChange}
                placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
              />
            </label>
          </div>

          <div className="checkout-payment-card">
            <h3>Phương thức thanh toán</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span>Thẻ nội địa / quốc tế</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                />
                <span>Ví điện tử / Chuyển khoản</span>
              </label>
            </div>
          </div>
        </div>

        <aside className="checkout-summary-card">
          <div className="summary-header">
            <h2>Đơn hàng của bạn</h2>
            <span>{cartItems.length} sản phẩm</span>
          </div>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="summary-item">
                <div className="summary-item-info">
                  <span>{item.product.name}</span>
                  <small>x{item.quantity}</small>
                </div>
                <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Tạm tính</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            {totalSavings > 0 && (
              <div className="summary-line savings">
                <span>Tiết kiệm</span>
                <strong>-{formatCurrency(totalSavings)}</strong>
              </div>
            )}
            <div className="summary-line">
              <span>Phí vận chuyển</span>
              <strong>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</strong>
            </div>
          </div>

          <div className="summary-total-row">
            <span>Tổng thanh toán</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button
            className="checkout-submit-btn"
            type="button"
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0}
          >
            Hoàn tất đặt hàng
          </button>

          <Link to="/cart" className="checkout-edit-cart">
            Quay lại giỏ hàng để chỉnh sửa
          </Link>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
