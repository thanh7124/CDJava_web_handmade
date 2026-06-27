import React, { useEffect, useState } from "react";
import { useOptionalAuth } from "../../context/AuthContext";
import {
  getReviewsByProduct,
  getReviewSummary,
  createReview,
} from "../../services/reviewService";
import "./ReviewSection.css";

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error?.message) return error.message;

  return "Không thể gửi đánh giá.";
};

const ReviewSection = ({ productId }) => {
  const auth = useOptionalAuth();

  const token = auth?.user?.token || "";

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    if (!productId) return;

    try {
      setLoadingReviews(true);

      const [reviewsData, summaryData] = await Promise.all([
        getReviewsByProduct(productId),
        getReviewSummary(productId),
      ]);

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      setSummary(
        summaryData || {
          averageRating: 0,
          totalReviews: 0,
        }
      );
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);

      setReviews([]);
      setSummary({
        averageRating: 0,
        totalReviews: 0,
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Bạn cần đăng nhập để đánh giá sản phẩm.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Vui lòng nhập nội dung nhận xét.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setMessage("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    try {
      setSubmitting(true);

      await createReview(
        productId,
        {
          rating,
          comment: comment.trim(),
        },
        token
      );

      setRating(5);
      setComment("");
      setMessage("Gửi đánh giá thành công.");

      await loadReviews();
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    const count = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));

    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    try {
      return new Date(dateValue).toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  return (
    <section className="review-section">
      <div className="review-header">
        <div>
          <h2>Đánh giá sản phẩm</h2>

          <p>
            {summary.totalReviews > 0
              ? `${summary.totalReviews} nhận xét từ khách hàng`
              : "Chưa có nhận xét nào cho sản phẩm này"}
          </p>
        </div>

        <div className="review-summary">
          <strong>{summary.averageRating || 0}/5</strong>
          <span>{renderStars(summary.averageRating)}</span>
        </div>
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="review-rating">
          <label htmlFor="review-rating">Số sao</label>

          <select
            id="review-rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={5}>5 sao</option>
            <option value={4}>4 sao</option>
            <option value={3}>3 sao</option>
            <option value={2}>2 sao</option>
            <option value={1}>1 sao</option>
          </select>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          rows="4"
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>

        {message && <p className="review-message">{message}</p>}
      </form>

      <div className="review-list">
        {loadingReviews ? (
          <p className="review-empty">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="review-empty">Chưa có nhận xét nào.</p>
        ) : (
          reviews.map((review) => (
            <div className="review-item" key={review.id}>
              <div className="review-item-top">
                <div>
                  <strong>{review.userName || "Người dùng"}</strong>

                  {review.orderId && (
                    <span className="review-verified">Đã mua hàng</span>
                  )}
                </div>

                <span>{renderStars(review.rating)}</span>
              </div>

              <p>{review.comment}</p>

              {review.createdDate && (
                <small>{formatDate(review.createdDate)}</small>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ReviewSection;