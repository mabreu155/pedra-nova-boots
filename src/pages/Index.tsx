import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useShopifyProducts";
import heroFlatlay from "@/assets/hero-flatlay.jpg";

const INITIAL_COUNT = 30;
const STEP = 12;


const Index = () => {
  const { data: products = [], isLoading, error } = useProducts();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);


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
            Couro legítimo.
            <br />
            Metal forjado.
          </motion.h1>

        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="colecao" className="px-6">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 pt-10" />

          {isLoading && (
            <p className="label text-muted-foreground py-10">Carregando coleção…</p>
          )}
          {error && !isLoading && (
            <p className="label text-muted-foreground py-10">Não foi possível carregar a coleção.</p>
          )}
          {!isLoading && !error && products.length === 0 && (
            <p className="label text-muted-foreground py-10">Nenhum produto disponível no momento.</p>
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
