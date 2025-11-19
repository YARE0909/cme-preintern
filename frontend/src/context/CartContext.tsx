"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  user: any;
  setUser: (user: any) => void;
}

const CartContext = createContext<CartContextType>({
  cartOpen: false,
  setCartOpen: () => {},
  toggleCart: () => {},
  user: null,
  setUser: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleCart = () => setCartOpen((prev) => !prev);

  return (
    <CartContext.Provider value={{ cartOpen, setCartOpen, toggleCart, user, setUser }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
