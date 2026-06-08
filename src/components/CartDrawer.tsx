import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { useI18n } from "@/i18n/I18nContext";
import ProductImage from "./ProductImage";
import CheckoutModal from "./CheckoutModal";

const CartDrawer = () => {
  const { t } = useI18n();
  const { isOpen, close, items, total, remove, decrement, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(13,13,13,0.35)", backdropFilter: "blur(6px)" }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full bg-background flex flex-col"
            style={{ width: "min(420px, 100vw)", borderLeft: "1px solid hsl(var(--border))" }}
            aria-label="Sacola de compras"
          >
            <div className="flex items-center justify-between px-6" style={{ height: 64, borderBottom: "1px solid hsl(var(--border))" }}>
              <span className="label">Sacola ({items.length})</span>
              <button onClick={close} aria-label="Fechar"><X size={20} strokeWidth={1.25} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="font-display italic text-2xl mb-2">Sacola vazia.</p>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Escolha sua próxima New Rock.</p>
                </div>
              ) : (
                <ul>
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-4 p-6" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      <div style={{ width: 80, flexShrink: 0, position: "relative" }}>
                        <ProductImage src={i.product.image} name={i.product.name} ratio="4/5" />
                        {i.qty > 1 && (
                          <span
                            className="absolute label flex items-center justify-center"
                            style={{
                              top: -6,
                              right: -6,
                              minWidth: 22,
                              height: 22,
                              padding: "0 6px",
                              borderRadius: 999,
                              background: "hsl(var(--foreground))",
                              color: "hsl(var(--background))",
                              fontSize: 10,
                              lineHeight: 1,
                            }}
                          >
                            x{i.qty}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <p className="font-sans font-semibold leading-tight" style={{ fontSize: "clamp(16px, 1.6vw, 20px)" }}>{i.product.name}</p>
                        <p className="label text-muted-foreground mt-1">{i.product.code}</p>
                        <p className="label text-muted-foreground mt-1">Tam {i.size}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <span className="font-sans font-normal" style={{ fontSize: "clamp(13px, 1.2vw, 16px)" }}>{formatPrice(i.product.price * i.qty)}</span>
                          <div className="flex items-center gap-3">
                            {i.qty > 1 && (
                              <button
                                onClick={() => decrement(i.id)}
                                aria-label="Diminuir quantidade"
                                className="label text-muted-foreground hover:text-foreground flex items-center justify-center"
                                style={{ width: 24, height: 24, border: "1px solid hsl(var(--border))", borderRadius: 999, lineHeight: 1 }}
                              >
                                −
                              </button>
                            )}
                            <button onClick={() => remove(i.id)} className="label text-muted-foreground hover:text-foreground">
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 py-6" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="flex items-baseline justify-between mb-4">
                <span className="label">Total</span>
                <span className="font-sans font-normal" style={{ fontSize: "clamp(13px, 1.2vw, 16px)" }}>{formatPrice(total)}</span>
              </div>
              <button
                disabled={items.length === 0}
                onClick={handleCheckout}
                className="w-full bg-foreground text-background label py-4 disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Finalizar compra
              </button>
            </div>
          </motion.aside>
        </>
      )}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items.map((i) => ({ product: i.product, size: i.size, qty: i.qty }))}
        onSuccess={() => {
          clear();
          close();
        }}
      />
    </AnimatePresence>
  );
};

export default CartDrawer;
