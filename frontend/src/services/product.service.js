import { products } from "../data/products";

export function getAllProducts() {
  return products;
}

export function getFeaturedProducts() {
  return products.slice(0, 6);
}

export function getBestSellerProducts() {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
}

export function getNewArrivalProducts() {
  return products.slice(-4).reverse();
}

export function getProductById(id) {
  return products.find((product) => product.id === Number(id));
}

export function getRelatedProducts(productId, category) {
  return products
    .filter(
      (product) =>
        product.id !== Number(productId) && product.category === category
    )
    .slice(0, 4);
}

export function getProductCategories() {
  const categories = products.map((product) => product.category);
  return ["Tất cả", ...new Set(categories)];
}

export function filterProducts({ keyword = "", category = "Tất cả", sort = "default" }) {
  let result = [...products];

  if (keyword.trim()) {
    const lowerKeyword = keyword.trim().toLowerCase();

    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.category.toLowerCase().includes(lowerKeyword)
    );
  }

  if (category !== "Tất cả") {
    result = result.filter((product) => product.category === category);
  }

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;

    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;

    case "best-seller":
      result.sort((a, b) => b.sold - a.sold);
      break;

    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;

    case "newest":
      result.sort((a, b) => b.id - a.id);
      break;

    default:
      break;
  }

  return result;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}