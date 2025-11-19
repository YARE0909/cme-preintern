"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartOpen: false,
  setCartOpen: () => {},
  toggleCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  const toggleCart = () => setCartOpen((prev) => !prev);

  return (
    <CartContext.Provider value={{ cartOpen, setCartOpen, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
