import { AlertTriangle, X } from "lucide-react";
import "./CancelOrderModal.css";

export default function CancelOrderModal({
  open,
  orderId,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="cancel-order-overlay" role="presentation" onMouseDown={loading ? undefined : onClose}>
      <section
        className="cancel-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="cancel-order-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="cancel-order-icon">
          <AlertTriangle size={30} />
        </div>

        <h2 id="cancel-order-title">Xác nhận hủy đơn hàng</h2>
        <p>
          Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderId}</strong>? Thao tác này
          không thể hoàn tác.
        </p>

        <div className="cancel-order-actions">
          <button
            type="button"
            className="cancel-order-back"
            onClick={onClose}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="button"
            className="cancel-order-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </section>
    </div>
  );
}
