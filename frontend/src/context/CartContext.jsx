import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products } from '../data/products';

const CartContext = createContext(null);

// Pre-seed cart with demo items so the page is never empty
const DEMO_CART = [
  { productId: 1, quantity: 2 },
  { productId: 2, quantity: 1 },
  { productId: 3, quantity: 3 },
];

function getInitialCart() {
  try {
    const stored = localStorage.getItem('handmade_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEMO_CART;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('handmade_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((productId, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Enrich cart items with product data
  const enrichedItems = cartItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean);

  const totalItems = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalSavings = enrichedItems.reduce((sum, item) => {
    if (item.product.oldPrice) {
      return sum + (item.product.oldPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);

  const value = {
    cartItems: enrichedItems,
    totalItems,
    subtotal,
    totalSavings,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function useOptionalCart() {
  return useContext(CartContext);
}

export { CartContext };
