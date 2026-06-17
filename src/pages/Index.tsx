import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useShopifyProducts";
import { useI18n } from "@/i18n/I18nContext";
import type { Product } from "@/data/products";
import heroFlatlay from "@/assets/hero-flatlay.jpg";

const INITIAL_COUNT = 30;
const STEP = 12;

type SortKey = "default" | "price_asc" | "price_desc";

const RECENT_DAYS = 10;

const Index = () => {
  const { t } = useI18n();
  const { data: products = [], isLoading, error } = useProducts();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [sort, setSort] = useState<SortKey>("default");
  const [recentOnly, setRecentOnly] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Compute ordered list + split index for the "recent" view
  const { ordered, recentCount } = useMemo(() => {
    if (recentOnly) {
      const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
      const withDates = products.map((p, i) => ({
        p,
        i,
        t: p.createdAt ? new Date(p.createdAt).getTime() : 0,
      }));
      withDates.sort((a, b) => b.t - a.t || a.i - b.i);
      const sorted = withDates.map((x) => x.p);
      const rc = withDates.filter((x) => x.t >= cutoff).length;
      return { ordered: sorted, recentCount: rc };
    }
    const arr = [...products];
    if (sort === "price_asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") arr.sort((a, b) => b.price - a.price);
    return { ordered: arr, recentCount: 0 };
  }, [products, sort, recentOnly]);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [sort, recentOnly]);

  useEffect(() => {
    if (visibleCount >= ordered.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + STEP, ordered.length));
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, ordered.length]);

  const selectSort = (key: SortKey) => {
    setRecentOnly(false);
    setSort(key);
  };

  const toggleRecent = () => {
    setRecentOnly((v) => !v);
  };

  const visible = ordered.slice(0, visibleCount);
  const visibleRecent = recentOnly ? visible.slice(0, Math.min(recentCount, visible.length)) : [];
  const visibleRest = recentOnly ? visible.slice(visibleRecent.length) : visible;

  const sortBtnBase =
    "label inline-flex items-center justify-center transition-colors border border-foreground/20 hover:border-foreground/60";
  const sortBtnInactive = "bg-transparent text-foreground/70";
  const sortBtnActive = "bg-foreground text-background border-foreground";

  return (
    <Layout>
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

          {/* Sort / filter bar */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <div className="inline-flex items-center gap-0 -space-x-px">
              {([
                { k: "default", l: "Padrão" },
                { k: "price_asc", l: "Menor preço" },
                { k: "price_desc", l: "Maior preço" },
              ] as { k: SortKey; l: string }[]).map((opt) => {
                const active = !recentOnly && sort === opt.k;
                return (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => selectSort(opt.k)}
                    className={`${sortBtnBase} ${active ? sortBtnActive : sortBtnInactive}`}
                    style={{ height: 36, padding: "0 14px", fontSize: 10 }}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleRecent}
              aria-pressed={recentOnly}
              className={`${sortBtnBase} ml-1 md:ml-2 ${recentOnly ? sortBtnActive : sortBtnInactive}`}
              style={{ height: 36, padding: "0 14px", fontSize: 10 }}
            >
              ★ Adicionados Recentemente
            </button>
          </div>

          {isLoading && (
            <p className="label text-muted-foreground py-10">{t("index.loading")}</p>
          )}
          {error && !isLoading && (
            <p className="label text-muted-foreground py-10">{t("index.error")}</p>
          )}
          {!isLoading && !error && products.length === 0 && (
            <p className="label text-muted-foreground py-10">{t("index.empty")}</p>
          )}

          {recentOnly && visibleRecent.length > 0 ? (
            <>
              <div className="relative">
                {/* Side label */}
                <span
                  aria-hidden
                  className="hidden md:block absolute label text-muted-foreground"
                  style={{
                    left: -8,
                    top: 24,
                    transform: "rotate(-90deg)",
                    transformOrigin: "left top",
                    letterSpacing: "0.2em",
                    fontSize: 10,
                  }}
                >
                  Recentes
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-14">
                  {visibleRecent.map((p: Product) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </div>

              {visibleRest.length > 0 && (
                <>
                  <hr className="my-10 md:my-14 border-foreground/10" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-14">
                    {visibleRest.map((p: Product) => (
                      <ProductCard key={p.slug} product={p} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-14">
              {visible.map((p: Product) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}

          {visibleCount < ordered.length && (
            <div ref={sentinelRef} aria-hidden className="h-10 w-full" />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
