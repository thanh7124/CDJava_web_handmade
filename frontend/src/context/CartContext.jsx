import React from 'react';

export const CartContext = React.createContext(null);

export function CartProvider({ children }) {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
}
