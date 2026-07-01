import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { checkoutApi } from "../../services/order.service";
import { formatCurrency } from "../../services/product.service";
import GhnAddressFields, {
  emptyGhnLocation,
  formatGhnAddress,
} from "../../components/address/GhnAddressFields";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const { cartItems, totalItems, loadCart, loadingCart } = useCart();

  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    note: "",
  });
  const [shippingLocation, setShippingLocation] = useState(emptyGhnLocation);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [successOrder, setSuccessOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setBillingInfo((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.fullName || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
    }));
  }, [user]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (!item.oldPrice) return total;

      return (
        total +
        (Number(item.oldPrice) - Number(item.price || 0)) *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [cartItems]);

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const validate = () => {
    const nextErrors = {};

    if (!billingInfo.fullName.trim()) {
      nextErrors.fullName = "Nhập họ tên người nhận";
    }

    if (!billingInfo.phone.trim()) {
      nextErrors.phone = "Nhập số điện thoại";
    } else if (!/^\d{10}$/.test(billingInfo.phone.trim())) {
      nextErrors.phone = "Số điện thoại phải có đúng 10 chữ số";
    }

    if (!billingInfo.address.trim()) {
      nextErrors.address = "Nhập địa chỉ giao hàng";
    }

    if (!shippingLocation.provinceId) nextErrors.province = "Chọn tỉnh / thành phố";
    if (!shippingLocation.districtId) nextErrors.district = "Chọn quận / huyện";
    if (!shippingLocation.wardCode) nextErrors.ward = "Chọn phường / xã";

    if (cartItems.length === 0) {
      nextErrors.cart = "Giỏ hàng đang trống";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setBillingInfo((prev) => ({
      ...prev,
      [name]:
        name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handlePlaceOrder = async () => {
    setSubmitError("");

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      const fullAddress = formatGhnAddress(
        billingInfo.address,
        shippingLocation
      );

      const order = await checkoutApi(user.token, {
        recipientName: billingInfo.fullName.trim(),
        phone: billingInfo.phone.trim(),
        address: fullAddress,
        note: billingInfo.note.trim(),
        paymentMethod,
      });

      setSuccessOrder(order);

      await loadCart();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Đặt hàng thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="checkout-page">
        <Header />

        <div className="checkout-confirmation">
          <h1>Đặt hàng thành công!</h1>

          <p>
            Cảm ơn bạn đã đặt hàng. Đơn hàng #{successOrder.id} của bạn đang
            được xử lý và sẽ được giao sớm nhất có thể.
          </p>

          <p>
            Tổng thanh toán:{" "}
            <strong>{formatCurrency(successOrder.totalAmount)}</strong>
          </p>

          <Link to="/" className="checkout-back-btn">
            Quay về trang chủ
          </Link>

          <Link
            to="/orders"
            className="checkout-edit-cart"
            style={{ marginTop: 12 }}
          >
            Xem đơn hàng của tôi
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
            <p>
              Nhập thông tin để chúng tôi giao hàng nhanh chóng và chính xác.
            </p>
          </div>

          {submitError && (
            <div className="checkout-alert-error">{submitError}</div>
          )}

          {errors.cart && (
            <div className="checkout-alert-error">{errors.cart}</div>
          )}

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
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
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
                placeholder="Số nhà, tên đường"
              />
              {errors.address && <small>{errors.address}</small>}
            </label>

            <GhnAddressFields
              token={user?.token}
              value={shippingLocation}
              onChange={setShippingLocation}
              fieldClassName="checkout-field"
              errors={errors}
            />

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
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                />
                <span>Thẻ nội địa / quốc tế</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={() => setPaymentMethod("BANK_TRANSFER")}
                />
                <span>Ví điện tử / Chuyển khoản</span>
              </label>
            </div>
          </div>
        </div>

        <aside className="checkout-summary-card">
          <div className="summary-header">
            <h2>Đơn hàng của bạn</h2>
            <span>{totalItems || cartItems.length} sản phẩm</span>
          </div>

          {loadingCart ? (
            <p>Đang tải giỏ hàng...</p>
          ) : (
            <div className="summary-items">
              {cartItems.length === 0 ? (
                <p>Giỏ hàng đang trống.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-info">
                      <span>{item.name}</span>
                      <small>x{item.quantity}</small>
                    </div>

                    <strong>
                      {formatCurrency(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                ))
              )}
            </div>
          )}

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
              <strong>
                {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
              </strong>
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
            disabled={cartItems.length === 0 || submitting}
          >
            {submitting ? "Đang đặt hàng..." : "Hoàn tất đặt hàng"}
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
