import { products } from "../data/products";
import axios from "axios";

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





const API_URL = "http://localhost:8080/api";

const BACKEND_URL = "http://localhost:8080";

export const FALLBACK_PRODUCT_IMAGE =
  "https://placehold.co/400x400?text=Handmade";

export function getProductImageUrl(image) {
  if (!image) return FALLBACK_PRODUCT_IMAGE;

  const value = String(image).trim();

  if (!value) return FALLBACK_PRODUCT_IMAGE;

  // Ảnh online
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // DB lưu dạng /uploads/products/abc.jpg
  if (value.startsWith("/uploads/")) {
    return `${BACKEND_URL}${value}`;
  }

  // DB lưu dạng uploads/products/abc.jpg
  if (value.startsWith("uploads/")) {
    return `${BACKEND_URL}/${value}`;
  }

  // DB chỉ lưu tên file: abc.jpg
  return `${BACKEND_URL}/uploads/products/${value}`;
}

export async function fetchProductPage({
  search = "",
  categoryId = "",
  sort = "newest",
  page = 1,
  limit = 8,
} = {}) {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", categoryId);

  params.append("sort", sort);
  params.append("page", page);
  params.append("limit", limit);

  const response = await fetch(`${API_URL}/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }

  const data = await response.json();

  return data.result;
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Không thể tải chi tiết sản phẩm");
  }

  const data = await response.json();

  return data.result;
}

export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("Không thể tải danh mục");
  }

  const data = await response.json();

  return data.result.data;
}