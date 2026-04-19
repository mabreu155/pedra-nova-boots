import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroFlatlay from "@/assets/hero-flatlay.jpg";

const Index = () => {
  return (
    <Layout>
      {/* HERO — store style */}
      <section
        className="relative px-6 flex items-center overflow-hidden"
        style={{ minHeight: "min(78vh, 760px)" }}
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
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="label inline-block"
            style={{ color: "rgba(247,245,242,0.7)" }}
          >
            Iconic Drop · Outono 2025
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display leading-[0.92] tracking-tight mt-5"
            style={{ fontSize: "clamp(44px, 7.5vw, 112px)", color: "#f7f5f2" }}
          >
            Couro legítimo.
            <br />
            Metal forjado.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 max-w-xl"
            style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(247,245,242,0.8)" }}
          >
            Engenharia metálica, couro legítimo e DNA rebelde. Cada New Rock é feita à mão na Espanha — para quem não tem medo de ocupar espaço.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => {
                document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="label"
              style={{
                background: "#f7f5f2",
                color: "#0d0d0d",
                border: "none",
                cursor: "pointer",
                padding: "16px 28px",
              }}
            >
              Shop Now
            </button>
            <Link
              to="/lookbook"
              className="label"
              style={{
                color: "#f7f5f2",
                border: "1px solid rgba(247,245,242,0.5)",
                padding: "16px 28px",
                textDecoration: "none",
              }}
            >
              Shop the Look
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="colecao" className="px-6">
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-end justify-between mb-10" style={{ borderBottom: "1px solid hsl(var(--border))", paddingBottom: 16 }}>
            <span className="label">Top Selling · {products.length} ícones</span>
            <span className="label text-muted-foreground hidden md:inline">Made in Spain · Brasil</span>
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
