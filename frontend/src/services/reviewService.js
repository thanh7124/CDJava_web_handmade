import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const getReviewsByProduct = async (productId) => {
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}/reviews`
  );

  return response.data;
};

export const getReviewSummary = async (productId) => {
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}/reviews/summary`
  );

  return response.data;
};

export const createReview = async (productId, reviewData, token) => {
  if (!token) {
    throw new Error("Bạn cần đăng nhập để đánh giá sản phẩm.");
  }

  const response = await axios.post(
    `${API_BASE_URL}/products/${productId}/reviews`,
    reviewData,
    getAuthConfig(token)
  );

  return response.data;
};

export const updateReview = async (reviewId, reviewData, token) => {
  if (!token) {
    throw new Error("Bạn cần đăng nhập để sửa đánh giá.");
  }

  const response = await axios.put(
    `${API_BASE_URL}/reviews/${reviewId}`,
    reviewData,
    getAuthConfig(token)
  );

  return response.data;
};

export const deleteReview = async (reviewId, token) => {
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xóa đánh giá.");
  }

  const response = await axios.delete(
    `${API_BASE_URL}/reviews/${reviewId}`,
    getAuthConfig(token)
  );

  return response.data;
};