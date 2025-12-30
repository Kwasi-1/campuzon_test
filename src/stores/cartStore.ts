import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

interface CartStore {
  storeID: string | null;
  storeName: string | null;
  storeSlug: string | null;
  items: CartItem[];
  
  // Computed
  itemCount: number;
  subtotal: number;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productID: string) => void;
  updateQuantity: (productID: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productID: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      storeID: null,
      storeName: null,
      storeSlug: null,
      items: [],

      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      addItem: (product, quantity = 1) => {
        const { items, storeID } = get();
        
        // Check if adding from different store
        if (storeID && storeID !== product.storeID) {
          toast.error('You can only order from one store at a time. Clear your cart first.');
          return;
        }

        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          // Check stock
          if (newQuantity > product.quantity) {
            toast.error(`Only ${product.quantity} available`);
            return;
          }

          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Check stock
          if (quantity > product.quantity) {
            toast.error(`Only ${product.quantity} available`);
            return;
          }

          set({
            storeID: product.storeID,
            storeName: product.store?.name || null,
            storeSlug: product.store?.slug || null,
            items: [...items, { product, quantity }],
          });
        }

        toast.success('Added to cart');
      },

      removeItem: (productID) => {
        const { items } = get();
        const newItems = items.filter((item) => item.product.id !== productID);
        
        set({
          items: newItems,
          storeID: newItems.length === 0 ? null : get().storeID,
          storeName: newItems.length === 0 ? null : get().storeName,
          storeSlug: newItems.length === 0 ? null : get().storeSlug,
        });

        toast.success('Removed from cart');
      },

      updateQuantity: (productID, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.product.id === productID);

        if (!item) return;

        if (quantity < 1) {
          get().removeItem(productID);
          return;
        }

        if (quantity > item.product.quantity) {
          toast.error(`Only ${item.product.quantity} available`);
          return;
        }

        set({
          items: items.map((i) =>
            i.product.id === productID ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({
          storeID: null,
          storeName: null,
          storeSlug: null,
          items: [],
        });
      },

      getItem: (productID) => {
        return get().items.find((item) => item.product.id === productID);
      },
    }),
    {
      name: 'campuzon-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
