import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";
import { products } from "@/data/products";

const quotes = [
  "Construída para durar mais que tendências.",
  "O som dos seus passos vira assinatura.",
  "Cada fivela é uma decisão. Cada metal, uma postura.",
  "Slim por fora. Pesada por dentro.",
  "O ícone que recusou virar nostalgia.",
  "Cano alto. Última palavra.",
];

const Lookbook = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="px-6 pt-20 md:pt-32 pb-24 md:pb-32" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">Lookbook · 2025</span>
          <h1
            className="font-display font-black mt-6 leading-[0.95]"
            style={{ fontSize: "clamp(64px, 13vw, 220px)" }}
          >
            Wear the
            <br />
            <span className="italic">Statement.</span>
          </h1>
        </div>
      </section>

      {/* ALTERNATING SECTIONS */}
      {products.map((p, i) => {
        const reverse = i % 2 === 1;
        return (
          <section
            key={p.slug}
            className="px-6 py-20 md:py-32"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <div className={`mx-auto max-w-[1480px] grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-20 items-center ${reverse ? "lg:[direction:rtl]" : ""}`}>
              <div className="lg:col-span-3" style={{ direction: "ltr" }}>
                <ProductImage name={p.name} ratio="4/5" />
              </div>
              <div className="lg:col-span-2" style={{ direction: "ltr" }}>
                <span className="label text-muted-foreground">{p.code}</span>
                <h2 className="font-display font-bold mt-3 leading-none" style={{ fontSize: "clamp(44px, 6vw, 88px)" }}>
                  {p.name}
                </h2>
                <p className="font-display italic text-muted-foreground mt-6" style={{ fontSize: 22, lineHeight: 1.4 }}>
                  “{quotes[i]}”
                </p>
                <Link to={`/produto/${p.slug}`} className="underline-link label inline-block mt-10">
                  Ver Produto
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </Layout>
  );
};

export default Lookbook;
