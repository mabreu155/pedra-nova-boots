import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";
import { products } from "@/data/products";
import look1 from "@/assets/lookbook-1.jpg";
import look2 from "@/assets/lookbook-2.jpg";
import look3 from "@/assets/lookbook-3.jpg";

const productQuotes = [
  "Construída para durar mais que tendências.",
  "O som dos seus passos vira assinatura.",
  "Cada fivela é uma decisão. Cada metal, uma postura.",
  "Slim por fora. Pesada por dentro.",
  "O ícone que recusou virar nostalgia.",
  "Cano alto. Última palavra.",
];

type Editorial = {
  src: string;
  index: string;
  title: string;
  italic: string;
  body: string;
  productSlug: string;
  productLabel: string;
};

const editorials: Editorial[] = [
  {
    src: look1,
    index: "01",
    title: "Underground.",
    italic: "Concreto. Couro. Plataforma.",
    body: "Estilo construído de baixo para cima. A bota define a silhueta — o resto do look apenas obedece.",
    productSlug: "wall006",
    productLabel: "Wall006",
  },
  {
    src: look2,
    index: "02",
    title: "Postura.",
    italic: "Sentar não é descansar. É dominar o espaço.",
    body: "Cano alto, fivelas em sequência, jaqueta de couro. Brutalismo encontra sob medida.",
    productSlug: "tower006",
    productLabel: "Tower006",
  },
  {
    src: look3,
    index: "03",
    title: "Madrugada.",
    italic: "A cidade dorme. A caveira não.",
    body: "Asfalto molhado, neon distante, passos pesados. O ícone Skull em movimento.",
    productSlug: "skull001",
    productLabel: "Skull001",
  },
];

const Lookbook = () => {
  return (
    <Layout>
      {/* HERO */}
      <section
        className="px-6 pt-20 md:pt-32 pb-24 md:pb-32"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
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

      {/* EDITORIAL FULL-BLEED SECTIONS */}
      {editorials.map((ed, i) => {
        const reverse = i % 2 === 1;
        return (
          <section key={ed.index} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${reverse ? "lg:[direction:rtl]" : ""}`}>
              {/* IMAGE — full bleed, no padding */}
              <div className="lg:col-span-7" style={{ direction: "ltr" }}>
                <div className="relative w-full" style={{ background: "#0d0d0d" }}>
                  <div style={{ paddingTop: "125%" }} />
                  <img
                    src={ed.src}
                    alt={`Editorial ${ed.title}`}
                    loading="lazy"
                    decoding="async"
                    width={1080}
                    height={1600}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* TEXT */}
              <div
                className="lg:col-span-5 px-6 md:px-12 py-16 md:py-24 flex flex-col justify-center"
                style={{ direction: "ltr" }}
              >
                <span className="label text-muted-foreground">Editorial · {ed.index}</span>
                <h2
                  className="font-display font-bold mt-4 leading-none"
                  style={{ fontSize: "clamp(48px, 6vw, 96px)" }}
                >
                  {ed.title}
                </h2>
                <p
                  className="font-display italic text-muted-foreground mt-6"
                  style={{ fontSize: 22, lineHeight: 1.4 }}
                >
                  “{ed.italic}”
                </p>
                <p className="mt-6 text-muted-foreground max-w-md" style={{ fontSize: 15, lineHeight: 1.7 }}>
                  {ed.body}
                </p>
                <Link
                  to={`/produto/${ed.productSlug}`}
                  className="underline-link label inline-block mt-10 self-start"
                >
                  Ver {ed.productLabel}
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* PRODUCT-FOCUSED ALTERNATING ROWS */}
      <section className="px-6 pt-20 pb-6">
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">A coleção · em detalhe</span>
        </div>
      </section>

      {products.map((p, i) => {
        const reverse = i % 2 === 1;
        return (
          <section
            key={p.slug}
            className="px-6 py-16 md:py-24"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <div
              className={`mx-auto max-w-[1480px] grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-20 items-center ${reverse ? "lg:[direction:rtl]" : ""}`}
            >
              <div className="lg:col-span-3" style={{ direction: "ltr" }}>
                <ProductImage src={p.image} name={p.name} ratio="4/5" />
              </div>
              <div className="lg:col-span-2" style={{ direction: "ltr" }}>
                <span className="label text-muted-foreground">{p.code}</span>
                <h3
                  className="font-display font-bold mt-3 leading-none"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {p.name}
                </h3>
                <p
                  className="font-display italic text-muted-foreground mt-6"
                  style={{ fontSize: 20, lineHeight: 1.4 }}
                >
                  “{productQuotes[i]}”
                </p>
                <Link
                  to={`/produto/${p.slug}`}
                  className="underline-link label inline-block mt-8"
                >
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
