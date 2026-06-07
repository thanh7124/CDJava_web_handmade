import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useOptionalAuth } from "./AuthContext";
import {
  addCartItemApi,
  clearCartApi,
  fetchCartApi,
  removeCartItemApi,
  updateCartItemApi,
} from "../services/cart.service";

const CartContext = createContext(null);

function normalizeCartItems(items = []) {
  return items.map((item) => ({
    id: item.productId,
    cartItemId: item.id,
    productId: item.productId,
    name: item.name,
    slug: item.slug,
    price: Number(item.price || 0),
    oldPrice: item.oldPrice ? Number(item.oldPrice) : null,
    image: item.image,
    categoryName: item.categoryName,
    stock: item.stock || 0,
    quantity: item.quantity || 1,
    totalPrice: Number(item.totalPrice || 0),
  }));
}

export function CartProvider({ children }) {
  const auth = useOptionalAuth();

  const token = auth?.user?.token || "";
  const userId = auth?.user?.id || null;
  const isAuthenticated = Boolean(token);

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  function syncCart(cartResponse) {
    setCartItems(normalizeCartItems(cartResponse?.items || []));
  }

  async function loadCart() {
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      setLoadingCart(true);
      setCartError("");

      const result = await fetchCartApi(token);

      syncCart(result);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      setCartError(
        error instanceof Error ? error.message : "Không thể tải giỏ hàng"
      );
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, [token, userId]);

  async function addToCart(product, quantity = 1) {
    if (!token) {
      throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
    }

    if (!product?.id) {
      throw new Error("Sản phẩm không hợp lệ");
    }

    const result = await addCartItemApi({
      token,
      productId: product.id,
      quantity,
    });

    syncCart(result);

    return result;
  }

  async function updateQuantity(productId, quantity) {
    if (!token) {
      throw new Error("Bạn cần đăng nhập để cập nhật giỏ hàng");
    }

    const safeQuantity = Number(quantity);

    if (safeQuantity <= 0) {
      return removeFromCart(productId);
    }

    const result = await updateCartItemApi({
      token,
      productId,
      quantity: safeQuantity,
    });

    syncCart(result);

    return result;
  }

  async function increaseQuantity(productId) {
    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item) return;

    if (item.stock && item.quantity >= item.stock) return;

    return updateQuantity(productId, item.quantity + 1);
  }

  async function decreaseQuantity(productId) {
    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item) return;

    if (item.quantity <= 1) {
      return removeFromCart(productId);
    }

    return updateQuantity(productId, item.quantity - 1);
  }

  async function removeFromCart(productId) {
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng");
    }

    const result = await removeCartItemApi({
      token,
      productId,
    });

    syncCart(result);

    return result;
  }

  async function clearCart() {
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xóa giỏ hàng");
    }

    await clearCartApi(token);

    setCartItems([]);
  }

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,
    loadingCart,
    cartError,

    cartCount,
    cartTotal,

    totalItems: cartCount,
    totalPrice: cartTotal,

    isAuthenticated,

    loadCart,
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }

  return context;
}

export function useOptionalCart() {
  return useContext(CartContext);
}