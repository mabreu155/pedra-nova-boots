import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useShopifyProducts";
import { useI18n } from "@/i18n/I18nContext";
import heroFlatlay from "@/assets/hero-flatlay.jpg";

const INITIAL_COUNT = 30;
const STEP = 12;


const Index = () => {
  const { t } = useI18n();
  const { data: products = [], isLoading, error } = useProducts();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [returnedFromCheckout, setReturnedFromCheckout] = useState(false);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pn_checkout_pending");
      if (!pending) return;
      const ref = document.referrer || "";
      const fromShopify = /shopify\.com|myshopify\.com/i.test(ref);
      const url = new URL(window.location.href);
      const qpFlag =
        url.searchParams.get("checkout") === "success" ||
        url.searchParams.get("order_confirmed") === "1";
      if (fromShopify || qpFlag) {
        setReturnedFromCheckout(true);
        sessionStorage.removeItem("pn_checkout_pending");
        if (qpFlag) {
          url.searchParams.delete("checkout");
          url.searchParams.delete("order_confirmed");
          window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
        }
      }
    } catch { /* ignore */ }
  }, []);


  useEffect(() => {
    if (visibleCount >= products.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + STEP, products.length));
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, products.length]);

  return (
    <Layout>
      {returnedFromCheckout && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 font-sans text-sm shadow-lg flex items-center gap-3"
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 10,
            maxWidth: "calc(100vw - 24px)",
          }}
          role="status"
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}
          >
            ✓
          </span>
          <span className="font-semibold">{t("index.checkoutReturn")}</span>
          <button
            aria-label="Fechar"
            onClick={() => setReturnedFromCheckout(false)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}


      {/* HERO — store style */}
      <section
        className="relative px-6 flex items-center overflow-hidden"
        style={{ minHeight: "100vh", height: "100vh" }}
      >
        <img
          src={heroFlatlay}
          alt="Botas New Rock originais — couro e metal sobre concreto"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,13,0.45) 0%, rgba(13,13,13,0.55) 100%)",
          }}
        />

        <div className="relative mx-auto max-w-[1480px] w-full py-24 md:py-32">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(44px, 7.5vw, 112px)", color: "#f7f5f2" }}
          >
            {t("index.heroLine1")}
            <br />
            {t("index.heroLine2")}
          </motion.h1>

        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="colecao" className="px-6">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 pt-10" />

          {isLoading && (
            <p className="label text-muted-foreground py-10">{t("index.loading")}</p>
          )}
          {error && !isLoading && (
            <p className="label text-muted-foreground py-10">{t("index.error")}</p>
          )}
          {!isLoading && !error && products.length === 0 && (
            <p className="label text-muted-foreground py-10">{t("index.empty")}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-14">
            {products.slice(0, visibleCount).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {visibleCount < products.length && (
            <div ref={sentinelRef} aria-hidden className="h-10 w-full" />
          )}
        </div>
      </section>


    </Layout>
  );
};

export default Index;
