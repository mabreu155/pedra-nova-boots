import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroFlatlay from "@/assets/hero-flatlay.jpg";

const Index = () => {
  return (
    <Layout>
      {/* HERO */}
      <section
        className="relative px-6 flex items-end overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* Background image */}
        <img
          src={heroFlatlay}
          alt="Botas New Rock dispostas em cimento escuro"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.35) 40%, rgba(13,13,13,0.85) 100%)",
          }}
        />

        <div className="relative mx-auto max-w-[1480px] w-full pb-16 md:pb-28 pt-32">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(56px, 11vw, 180px)", color: "#f7f5f2" }}
          >
            New Rock.
            <br />
            <span className="font-bold">Só as originais.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-10 md:mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <p
              className="max-w-md"
              style={{ fontSize: 15, letterSpacing: "0.02em", color: "rgba(247,245,242,0.75)" }}
            >
              A maior seleção de botas New Rock do Brasil. Curadoria, autenticidade e atendimento direto.
            </p>
            <button
              type="button"
              onClick={() => {
                document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="underline-link label self-start md:self-end"
              style={{ color: "#f7f5f2", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            >
              Ver Coleção
            </button>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="colecao" className="px-6">
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-end justify-between mb-10" style={{ borderBottom: "1px solid hsl(var(--border))", paddingBottom: 16 }}>
            <span className="label">Coleção · {products.length} modelos</span>
            <span className="label text-muted-foreground hidden md:inline">Brasil → Espanha</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Index;
