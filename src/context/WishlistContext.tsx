import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";

export type WishlistItem = {
  slug: string;
  product: Product;
  addedAt: number;
};

type WishlistCtx = {
  items: WishlistItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  has: (slug: string) => boolean;
  toggle: (product: Product) => boolean; // returns new state (true = added)
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<WishlistCtx | null>(null);
const STORAGE_KEY = "pn:wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as WishlistItem[];
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback((product: Product) => {
    let added = false;
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === product.slug);
      if (exists) {
        added = false;
        return prev.filter((i) => i.slug !== product.slug);
      }
      added = true;
      return [{ slug: product.slug, product, addedAt: Date.now() }, ...prev];
    });
    return added;
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <Ctx.Provider
      value={{
        items,
        count: items.length,
        isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        has,
        toggle,
        remove,
        clear,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
