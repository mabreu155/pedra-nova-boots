import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, Heart, Bookmark, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";
import CheckoutModal from "@/components/CheckoutModal";
import { getProduct, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductPage = () => {
  const { slug = "" } = useParams();
  const product = getProduct(slug);
  const { add } = useCart();
  const [size, setSize] = useState<number | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <Layout>
        <div className="px-6 py-32 text-center">
          <h1 className="font-display text-5xl mb-4">Modelo fora de coleção.</h1>
          <Link to="/" className="underline-link label">Voltar à loja</Link>
        </div>
      </Layout>
    );
  }

  const handleAdd = () => {
    if (!size) return;
    add(product, size);
  };

  const handleBuyNow = () => {
    if (!size) return;
    setCheckoutOpen(true);
  };

  const images = [0, 1, 2, 3];

  return (
    <Layout>
      <div className="px-4 md:px-6 pt-6 md:pt-10">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="label text-muted-foreground flex items-center gap-2 flex-wrap" style={{ fontSize: 11 }}>
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>›</span>
            <Link to="/" className="hover:text-foreground">{product.category}</Link>
            <span>›</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8 md:gap-10">
            {/* IMAGES — swipeable carousel */}
            <div>
              <div className="relative">
                <div
                  ref={scrollerRef}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const idx = Math.round(el.scrollLeft / el.clientWidth);
                    if (idx !== activeImg) setActiveImg(idx);
                  }}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((i) => (
                    <div key={i} className="shrink-0 w-full snap-center">
                      <ProductImage src={product.image} name={product.name} ratio="1/1" priority={i === 0} />
                    </div>
                  ))}
                </div>

                {/* Floating action buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    aria-label="Favoritar"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-secondary transition-colors"
                    style={{ border: "1px solid hsl(var(--border))" }}
                  >
                    <Heart size={18} />
                  </button>
                  <button
                    aria-label="Salvar"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-secondary transition-colors"
                    style={{ border: "1px solid hsl(var(--border))" }}
                  >
                    <Bookmark size={18} />
                  </button>
                </div>

                {/* Prev/next nav — desktop only */}
                <button
                  onClick={() => {
                    const el = scrollerRef.current;
                    if (!el) return;
                    el.scrollTo({ left: Math.max(0, (activeImg - 1) * el.clientWidth), behavior: "smooth" });
                  }}
                  aria-label="Imagem anterior"
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background items-center justify-center hover:bg-secondary transition-colors z-10"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    const el = scrollerRef.current;
                    if (!el) return;
                    el.scrollTo({ left: Math.min((images.length - 1) * el.clientWidth, (activeImg + 1) * el.clientWidth), behavior: "smooth" });
                  }}
                  aria-label="Próxima imagem"
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background items-center justify-center hover:bg-secondary transition-colors z-10"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <ChevronRight size={18} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full transition-opacity"
                      style={{
                        background: "hsl(var(--background))",
                        opacity: activeImg === i ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* INFO (right column, sticky like Depop) */}
            <div className="md:sticky md:top-6 md:self-start space-y-4">
              {/* Status chips */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 label"
                  style={{
                    padding: "6px 10px",
                    background: "hsl(var(--secondary))",
                    borderRadius: 999,
                    fontSize: 11,
                  }}
                >
                  <ShoppingBag size={12} /> Em alta
                </span>
                {product.badge && (
                  <span
                    className="inline-flex items-center gap-1.5 label"
                    style={{
                      padding: "6px 10px",
                      background: "hsl(var(--secondary))",
                      borderRadius: 999,
                      fontSize: 11,
                    }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-bold leading-tight font-sans text-2xl">
                {product.name}
              </h1>

              {/* Price */}
              <p className="font-sans font-bold text-2xl">{formatPrice(product.price)}</p>

              {/* Meta line */}
              <p className="font-sans text-sm text-muted-foreground">
                {size ? `Tamanho EU ${size}` : "Selecione um tamanho"} · Novo · <span className="underline">{product.category}</span>
              </p>

              {/* SIZE SELECTOR */}
              <div>
                <p className="label mb-2" style={{ fontSize: 11 }}>Tamanho EU</p>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 11 }, (_, i) => 36 + i).map((n) => {
                    const available = product.sizes.includes(n);
                    const selected = size === n;
                    return (
                      <button
                        key={n}
                        disabled={!available}
                        onClick={() => setSize(n)}
                        className="font-sans text-sm transition-colors"
                        style={{
                          padding: "10px 0",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 6,
                          background: selected ? "hsl(var(--foreground))" : "transparent",
                          color: !available ? "hsl(var(--muted-foreground))" : selected ? "hsl(var(--background))" : "hsl(var(--foreground))",
                          opacity: available ? 1 : 0.35,
                          cursor: available ? "pointer" : "not-allowed",
                          textDecoration: !available ? "line-through" : "none",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTAs (Depop-style stacked) */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={!size}
                  className="w-full bg-foreground text-background font-sans font-semibold text-sm py-3.5 disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ borderRadius: 8 }}
                >
                  Comprar agora
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!size}
                  className="w-full font-sans font-semibold text-sm py-3.5 transition-colors hover:bg-secondary disabled:opacity-40"
                  style={{ border: "1px solid hsl(var(--foreground))", borderRadius: 8 }}
                >
                  Adicionar à sacola
                </button>
              </div>

              {/* Buyer protection */}
              <div
                className="flex gap-3 p-3"
                style={{ border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              >
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <p className="font-sans text-xs leading-relaxed">
                  Todas as compras na Pedra Nova têm <span className="font-semibold">Proteção ao Comprador</span>.{" "}
                  <a className="underline" href="#">Saiba mais</a>
                </p>
              </div>

              {/* Description */}
              <div className="pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <p className="font-sans text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
                <p className="font-sans text-sm leading-relaxed mt-3">
                  Código: <span className="font-semibold">{product.code}</span>
                </p>
              </div>

              {/* Details */}
              <ul>
                {product.details.map((d, i) => (
                  <li
                    key={i}
                    className="font-sans text-sm py-3 flex items-start gap-2"
                    style={{ borderBottom: "1px solid hsl(var(--border))", borderTop: i === 0 ? "1px solid hsl(var(--border))" : "none" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              {/* Seller card */}
              <div
                className="flex items-center justify-between gap-3 p-3"
                style={{ border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-sm"
                    style={{ background: "hsl(var(--secondary))" }}
                  >
                    PN
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm leading-tight">pedra_nova</p>
                    <p className="font-sans text-xs text-muted-foreground">Loja oficial · Brasil</p>
                  </div>
                </div>
                <button
                  className="font-sans font-semibold text-xs px-3 py-2 hover:bg-secondary transition-colors"
                  style={{ border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                >
                  Visitar
                </button>
              </div>

              {/* Payment */}
              <div className="p-3" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
                <p className="label mb-1" style={{ fontSize: 11 }}>Envio</p>
                <p className="font-sans text-xs">Envio para todo o Brasil.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={product} size={size} />
    </Layout>
  );
};

export default ProductPage;
