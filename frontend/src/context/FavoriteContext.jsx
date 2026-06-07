import { createContext, useContext, useEffect, useMemo, useState } from "react";
import favoriteService from "../services/favorite.service";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => favoriteService.getFavoriteIds());

  const totalFavorites = favoriteIds.length;

  function toggleFavorite(id) {
    const updatedIds = favoriteService.toggleFavorite(id);
    setFavoriteIds([...updatedIds]);
  }

  function isFavorite(id) {
    return favoriteIds.includes(Number(id));
  }

  const value = useMemo(
    () => ({
      favoriteIds,
      totalFavorites,
      toggleFavorite,
      isFavorite,
    }),
    [favoriteIds]
  );

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
