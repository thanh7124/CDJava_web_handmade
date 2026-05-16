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
export function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}