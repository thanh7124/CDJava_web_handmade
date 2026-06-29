import { createContext, useContext, useEffect, useState } from "react";
import { useOptionalAuth } from "./AuthContext";
import favoriteService from "../services/favorite.service";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const auth = useOptionalAuth();

  const user = auth?.user || null;
  const userId = user?.id || null;
  const token = user?.token || "";

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  useEffect(() => {
    const loadFavorites = async () => {
      if (!userId || !token) {
        setFavoriteIds([]);
        setFavoriteError("");
        return;
      }

      try {
        setLoadingFavorites(true);
        setFavoriteError("");

        const ids = await favoriteService.getFavoriteIds(userId, token);
        setFavoriteIds(Array.isArray(ids) ? ids : []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm yêu thích:", error);
        setFavoriteIds([]);

        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          setFavoriteError("");
          return;
        }

        setFavoriteError(
          error instanceof Error
            ? error.message
            : "Không thể tải sản phẩm yêu thích"
        );
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [userId, token]);

  const toggleFavorite = async (productId) => {
    if (!userId || !token) {
      alert("Vui lòng đăng nhập");
      return;
    }

    try {
      setFavoriteError("");

      const updatedIds = await favoriteService.toggleFavorite(
        userId,
        productId,
        token
      );

      setFavoriteIds(Array.isArray(updatedIds) ? updatedIds : []);
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật sản phẩm yêu thích";

      setFavoriteError(message);
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.includes(Number(productId));
  };

  const value = {
    favoriteIds,
    loadingFavorites,
    favoriteError,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavorite phải được dùng bên trong FavoriteProvider");
  }

  return context;
}

export function useOptionalFavorite() {
  return useContext(FavoriteContext);
}