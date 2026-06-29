import axios from "axios";

const API_URL = "http://localhost:8080/api/favorites";

const getAuthConfig = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  },
});

async function getFavoriteIds(userId, token) {
  if (!userId || !token) {
    return [];
  }

  const response = await axios.get(`${API_URL}/${userId}`, getAuthConfig(token));

  return Array.isArray(response.data) ? response.data : [];
}

async function toggleFavorite(userId, productId, token) {
  if (!userId || !token) {
    throw new Error("Vui lòng đăng nhập để sử dụng yêu thích");
  }

  await axios.post(
    `${API_URL}/toggle`,
    {
      userId,
      productId,
    },
    getAuthConfig(token)
  );

  return getFavoriteIds(userId, token);
}

export default {
  getFavoriteIds,
  toggleFavorite,
};