const LS_KEY = "hm_favorites";

export function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function isFavorite(id) {
  const ids = getFavoriteIds();
  return ids.includes(Number(id));
}

export function toggleFavorite(id) {
  const ids = getFavoriteIds();
  const nid = Number(id);

  const idx = ids.indexOf(nid);
  if (idx === -1) {
    ids.push(nid);
  } else {
    ids.splice(idx, 1);
  }

  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch (e) {
    // ignore
  }

  return ids;
}

export function clearFavorites() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {}
}

export default {
  getFavoriteIds,
  isFavorite,
  toggleFavorite,
  clearFavorites,
};
