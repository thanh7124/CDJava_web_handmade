import { createContext, useContext, useEffect, useState } from "react";
import { useOptionalAuth } from "./AuthContext";
import favoriteService from "../services/favorite.service";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const auth = useOptionalAuth();
  const user = auth?.user;
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const ids = await favoriteService.getFavoriteIds(user.id);
        setFavoriteIds(ids);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm yêu thích:", error);
      }
    };

    if (user && user.id) {
      loadFavorites();
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  const toggleFavorite = async (productId) => {
    if (!user) {
      alert("Vui lòng đăng nhập");
      return;
    }

    try {
      const updatedIds = await favoriteService.toggleFavorite(
        user.id,
        productId
      );
      setFavoriteIds(updatedIds);
    } catch (error) {
      console.error(error);
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.includes(productId);
  };

  const value = {
    favoriteIds,
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

