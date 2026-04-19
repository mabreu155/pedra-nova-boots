import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const Index = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="px-6 pt-16 md:pt-28 pb-24 md:pb-40">
        <div className="mx-auto max-w-[1480px]">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(56px, 11vw, 180px)" }}
          >
            New Rock.
            <br />
            <span className="italic font-bold">Só as originais.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-10 md:mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <p className="text-muted-foreground max-w-md" style={{ fontSize: 15, letterSpacing: "0.02em" }}>
              A maior seleção de botas New Rock do Brasil. Curadoria, autenticidade e atendimento direto.
            </p>
            <Link to="#colecao" className="underline-link label self-start md:self-end">
              Ver Coleção
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE STRIP */}
      <section className="mt-32 md:mt-48 px-6 py-24 md:py-40" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
        <p
          className="font-display italic text-center mx-auto max-w-5xl"
          style={{ fontSize: "clamp(32px, 6vw, 88px)", lineHeight: 1.1 }}
        >
          “Não é uma bota. É uma declaração.”
        </p>
      </section>
    </Layout>
  );
};

export default Index;
