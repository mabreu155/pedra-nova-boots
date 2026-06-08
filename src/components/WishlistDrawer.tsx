import { AnimatePresence, motion } from "framer-motion";
import { X, Heart } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";

const WishlistDrawer = () => {
  const { isOpen, close, items, remove } = useWishlist();

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
            aria-label="Lista de desejos"
          >
            <div
              className="flex items-center justify-between px-6"
              style={{ height: 64, borderBottom: "1px solid hsl(var(--border))" }}
            >
              <span className="label inline-flex items-center gap-2">
                <Heart size={14} strokeWidth={1.5} /> Lista de desejos ({items.length})
              </span>
              <button onClick={close} aria-label="Fechar">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="font-display italic text-2xl mb-2">Nenhum desejo ainda.</p>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>
                    Toque no coração de uma bota para salvá-la aqui.
                  </p>
                </div>
              ) : (
                <ul>
                  {items.map((i) => (
                    <li
                      key={i.slug}
                      className="flex gap-4 p-6"
                      style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    >
                      <Link to={`/produto/${i.slug}`} onClick={close} style={{ width: 80, flexShrink: 0 }}>
                        <ProductImage src={i.product.image} name={i.product.name} ratio="4/5" />
                      </Link>
                      <div className="flex-1 flex flex-col">
                        <Link
                          to={`/produto/${i.slug}`}
                          onClick={close}
                          className="font-sans font-semibold leading-tight hover:underline"
                          style={{ fontSize: "clamp(16px, 1.6vw, 20px)" }}
                        >
                          {i.product.name}
                        </Link>
                        <p className="label text-muted-foreground mt-1">{i.product.code}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <span
                            className="font-sans font-normal"
                            style={{ fontSize: "clamp(13px, 1.2vw, 16px)" }}
                          >
                            {formatPrice(i.product.price)}
                          </span>
                          <button
                            onClick={() => remove(i.slug)}
                            className="label text-muted-foreground hover:text-foreground"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
