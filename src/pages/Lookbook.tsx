import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";
import { useCollectionProducts } from "@/hooks/useShopifyProducts";
import { useI18n } from "@/i18n/I18nContext";
import look1 from "@/assets/lookbook-1.jpg";
import look2 from "@/assets/lookbook-2.jpg";
import look3 from "@/assets/lookbook-3.jpg";

type Editorial = {
  src: string;
  index: string;
  key: "ed1" | "ed2" | "ed3";
  productSlug: string;
};

const editorials: Editorial[] = [
  { src: look1, index: "01", key: "ed1", productSlug: "wall006" },
  { src: look2, index: "02", key: "ed2", productSlug: "tower006" },
  { src: look3, index: "03", key: "ed3", productSlug: "skull001" },
];

type ProductOverrideKey = "archive" | "military" | "dystopian";

const pickProductOverride = (name: string, code: string): ProductOverrideKey | null => {
  const n = (name || "").toLowerCase();
  const c = (code || "").toUpperCase();
  if (n.includes("flames")) return "military";
  if (n.includes("strapped")) return "dystopian";
  if (c.includes("MR010") || n.includes("mr010")) return "archive";
  return null;
};

const Lookbook = () => {
  const { t } = useI18n();
  const { data: products = [] } = useCollectionProducts("lookbook");
  return (
    <Layout>
      {/* HERO */}
      <section
        className="px-6 pt-20 md:pt-32 pb-24 md:pb-32"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">{t("lookbook.tag")}</span>
          <h1
            className="font-display font-black mt-6 leading-[0.95] text-7xl text-center"
            style={{ fontSize: "clamp(64px, 13vw, 220px)" }}
          >
            {t("lookbook.headline1")}
            <br />
            <span className="italic">{t("lookbook.headline2")}</span>
          </h1>
          <p
            className="mx-auto mt-10 md:mt-14 text-center text-muted-foreground max-w-3xl"
            style={{ fontSize: 17, lineHeight: 1.7 }}
          >
            {t("lookbook.intro")}
          </p>
        </div>
      </section>

      {/* EDITORIAL FULL-BLEED SECTIONS */}
      {editorials.map((ed, i) => {
        const reverse = i % 2 === 1;
        return (
          <section key={ed.index} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${reverse ? "lg:[direction:rtl]" : ""}`}>
              <div className="lg:col-span-7" style={{ direction: "ltr" }}>
                <div className="relative w-full" style={{ background: "#0d0d0d" }}>
                  <div style={{ paddingTop: "125%" }} />
                  <img
                    src={ed.src}
                    alt={`Editorial ${t(`lookbook.${ed.key}.title`)}`}
                    loading="lazy"
                    decoding="async"
                    width={1080}
                    height={1600}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              <div
                className="lg:col-span-5 px-6 md:px-12 py-16 md:py-24 flex flex-col justify-center"
                style={{ direction: "ltr" }}
              >
                <span className="label text-muted-foreground">{t("lookbook.editorial")} · {ed.index}</span>
                <h2
                  className="font-display font-bold mt-4 leading-none"
                  style={{ fontSize: "clamp(48px, 6vw, 96px)" }}
                >
                  {t(`lookbook.${ed.key}.title`)}
                </h2>
                <p
                  className="font-display italic text-muted-foreground mt-6"
                  style={{ fontSize: 22, lineHeight: 1.4 }}
                >
                  “{t(`lookbook.${ed.key}.italic`)}”
                </p>
                <p className="mt-6 text-muted-foreground max-w-md" style={{ fontSize: 15, lineHeight: 1.7 }}>
                  {t(`lookbook.${ed.key}.body`)}
                </p>
                <Link
                  to={`/produto/${ed.productSlug}`}
                  className="underline-link label inline-block mt-10 self-start"
                >
                  {t(`lookbook.${ed.key}.cta`)}
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      <section className="px-6 pt-20 pb-6">
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">{t("lookbook.collection")}</span>
        </div>
      </section>

      {products.map((p, i) => {
        const reverse = i % 2 === 1;
        const overrideKey = pickProductOverride(p.name, p.code);
        const kicker = overrideKey ? t(`lookbook.p.${overrideKey}.kicker`) : p.code;
        const italicLine = overrideKey ? t(`lookbook.p.${overrideKey}.condition`) : null;
        const bodyLine = overrideKey ? t(`lookbook.p.${overrideKey}.body`) : null;
        const cta = overrideKey
          ? t(`lookbook.p.${overrideKey}.cta`)
          : `${t("lookbook.shop")} ${p.name}`;
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
                <span className="label text-muted-foreground">{kicker}</span>
                <h3
                  className="font-display font-bold mt-3 leading-none"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {p.name}
                </h3>
                {italicLine && (
                  <p
                    className="font-display italic text-muted-foreground mt-6"
                    style={{ fontSize: 20, lineHeight: 1.4 }}
                  >
                    {italicLine}
                  </p>
                )}
                {bodyLine && (
                  <p className="mt-4 text-muted-foreground max-w-md" style={{ fontSize: 15, lineHeight: 1.7 }}>
                    {bodyLine}
                  </p>
                )}
                <Link
                  to={`/produto/${p.slug}`}
                  className="underline-link label inline-block mt-8"
                >
                  {cta}
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
