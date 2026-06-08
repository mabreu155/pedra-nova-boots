import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  id: string; // slug + size
  product: Product;
  size: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, size: number) => void;
  remove: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  const add = useCallback((product: Product, size: number) => {
    const id = `${product.slug}-${size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, product, size, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev.flatMap((i) =>
        i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i]
      )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.product.price, 0);

  return (
    <Ctx.Provider
      value={{
        items, count, total, isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        add, remove, clear,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
