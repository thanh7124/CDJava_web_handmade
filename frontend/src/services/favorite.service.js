import axios from "axios";

const API_URL = "http://localhost:8080/api/favorites";

async function getFavoriteIds(userId) {

    const response = await axios.get(
        `${API_URL}/${userId}`
    );

    return response.data;
}

async function toggleFavorite(userId, productId) {

    await axios.post(
        `${API_URL}/toggle`,
        {
            userId,
            productId
        }
    );

    return getFavoriteIds(userId);
}

export default {
    getFavoriteIds,
    toggleFavorite
};