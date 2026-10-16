import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  ids: number[];
  toggle: (id: number) => void;
}

/** Local-first favourites; no account or remote tracking. */
export const useWishlist = create<WishlistState>()(persist(
  (set) => ({
    ids: [],
    toggle: id => set(state => ({
      ids: state.ids.includes(id)
        ? state.ids.filter(existing => existing !== id)
        : [...state.ids, id],
    })),
  }),
  { name: "trosheen-wishlist-v1", storage: createJSONStorage(() => localStorage) },
));
