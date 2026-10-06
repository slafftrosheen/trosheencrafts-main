import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CustomConfiguration {
  vesselId: number;
  finishId: number;
  waxId: number;
  aromaId: number;
  customDescription?: string;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  customConfiguration?: CustomConfiguration;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number | string, variant?: string) => void;
  updateQuantity: (id: number | string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.variant === item.variant
          );
          
          if (existingItem) {
            return {
              items: state.items.map((i) => {
                if (i.id !== item.id || i.variant !== item.variant) return i;
                const maxStock = item.maxStock ?? i.maxStock;
                return {
                  ...i,
                  maxStock,
                  quantity: maxStock
                    ? Math.min(i.quantity + 1, maxStock)
                    : i.quantity + 1,
                };
              }),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (id, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.variant === variant)
          ),
        }));
      },

      updateQuantity: (id, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(id, variant);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.variant === variant
              ? {
                  ...item,
                  quantity: item.maxStock
                    ? Math.min(quantity, item.maxStock)
                    : quantity,
                }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
