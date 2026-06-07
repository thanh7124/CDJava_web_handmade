import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "handmade_cart";

function readCartFromStorage() {
  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    return rawCart ? JSON.parse(rawCart) : [];
  } catch (error) {
    console.error("Không thể đọc giỏ hàng:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readCartFromStorage);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product, quantity = 1) {
    if (!product) return;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price || 0),
          oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
          image: product.image,
          categoryName: product.categoryName,
          stock: product.stock || 0,
          quantity,
        },
      ];
    });
  }

  function decreaseQuantity(productId) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(productId) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                item.stock && item.quantity >= item.stock
                  ? item.quantity
                  : item.quantity + 1,
            }
          : item
      )
    );
  }

  function updateQuantity(productId, quantity) {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                item.stock && safeQuantity > item.stock
                  ? item.stock
                  : safeQuantity,
            }
          : item
      )
    );
  }

  function removeFromCart(productId) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,

    // Tên mới
    cartCount,
    cartTotal,

    // Tên cũ để Header/Cart cũ không bị lỗi
    totalItems: cartCount,
    totalPrice: cartTotal,

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