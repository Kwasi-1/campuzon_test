import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";
import { savedItemsService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => Promise<void> | void;
  removeFromWishlist: (productId: number | string) => Promise<void> | void;
  isInWishlist: (productId: number | string) => boolean;
  clearWishlist: () => Promise<void> | void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { user } = useAuth();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const items = await savedItemsService.getSavedItems();
          setWishlistItems(items);
          return;
        } catch (e) {
          // fall through to local storage
        }
      }
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    };
    load();
  }, [user]);

  // Save wishlist to localStorage whenever it changes for guests only
  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const addToWishlist = async (product: Product) => {
    if (user) {
      await savedItemsService.add(product.id);
      // Refresh from server to keep single source of truth
      const items = await savedItemsService.getSavedItems();
      setWishlistItems(items);
    } else {
      setWishlistItems((prevItems) => {
        if (prevItems.find((item) => item.id === product.id)) {
          return prevItems; // Already in wishlist
        }
        return [...prevItems, product];
      });
    }
  };

  const removeFromWishlist = async (productId: number | string) => {
    if (user) {
      await savedItemsService.remove(productId);
      const items = await savedItemsService.getSavedItems();
      setWishlistItems(items);
    } else {
      setWishlistItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    }
  };

  const isInWishlist = (productId: number | string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = async () => {
    // No bulk clear endpoint yet; client-side clear only
    setWishlistItems([]);
    if (!user) {
      localStorage.removeItem("wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
