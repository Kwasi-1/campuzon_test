import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";
import { cartService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void> | void;
  removeFromCart: (productId: number | string) => Promise<void> | void;
  updateQuantity: (
    productId: number | string,
    quantity: number
  ) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart: if authenticated, load from API; else from localStorage
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const cart = await cartService.getCart();
          // Assuming CartItem is compatible with service CartItem
          setCartItems(cart.items as unknown as CartItem[]);
        } catch (e) {
          // fallback to local storage if API fails
          const savedCart = localStorage.getItem("cart");
          if (savedCart) setCartItems(JSON.parse(savedCart));
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };
    load();
  }, [user]);

  // Save cart to localStorage for guests only
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (user) {
      // Use API as source of truth
      await cartService.addToCart({ productId: product.id, quantity });
      const cart = await cartService.getCart();
      setCartItems(cart.items as unknown as CartItem[]);
    } else {
      // Guest: local state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { ...product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: number | string) => {
    if (user) {
      await cartService.removeFromCart({ itemId: productId });
      const cart = await cartService.getCart();
      setCartItems(cart.items as unknown as CartItem[]);
    } else {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    }
  };

  const updateQuantity = async (
    productId: number | string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (user) {
      await cartService.updateCartItem({ itemId: productId, quantity });
      const cart = await cartService.getCart();
      setCartItems(cart.items as unknown as CartItem[]);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      await cartService.clearCart();
    }
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
