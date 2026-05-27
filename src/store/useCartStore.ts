import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  color?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) =>
        set((state) => {
          // চেক করা হচ্ছে এই আইডি'র প্রোডাক্ট আগে থেকেই আছে কি না
          const existingItem = state.items.find(
            (item) => item.id === newItem.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item,
              ),
              isOpen: true,
            };
          }
          // নতুন আইডি হলে নতুন আইটেম হিসেবে যোগ হবে
          return { items: [...state.items, newItem], isOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: "socksful-cart" },
  ),
);
