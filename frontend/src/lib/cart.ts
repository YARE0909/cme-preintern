// src/lib/cart.ts
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

const KEY = "nourish_cart_v1";

export function loadCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  sessionStorage.setItem(KEY, JSON.stringify(items));
}

export function clearCart() {
  sessionStorage.removeItem(KEY);
}
