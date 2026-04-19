import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";
import { getProduct, formatPrice, WHATSAPP_NUMBER } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductPage = () => {
  const { slug = "" } = useParams();
  const product = getProduct(slug);
  const { add } = useCart();
  const [size, setSize] = useState<number | null>(null);
  const [activeThumb, setActiveThumb] = useState(0);

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

  const handleWhats = () => {
    const msg = `Olá Kaique! Vi no site da Pedra Nova e tenho interesse nessa bota:\n\n*${product.name}* (${product.code})\nTamanho: ${size ?? "(definir)"}\n\nPoderia me dar mais informações e disponibilidade?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Layout>
      <div className="px-6 pt-10 md:pt-16">
        <div className="mx-auto max-w-[1480px]">
          <Link to="/" className="label text-muted-foreground hover:text-foreground">← Shop</Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* IMAGES */}
            <div>
              <ProductImage src={product.image} name={product.name} ratio="4/5" priority />
              <div className="grid grid-cols-4 gap-3 mt-3">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className="block"
                    style={{ outline: activeThumb === i ? "1px solid hsl(var(--foreground))" : "1px solid transparent" }}
                    aria-label={`Imagem ${i + 1}`}
                  >
                    <ProductImage src={product.image} name={product.name} ratio="1/1" />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO */}
            <div className="lg:pt-4">
              {product.badge && <span className="label text-muted-foreground">{product.badge} · {product.category}</span>}
              {!product.badge && <span className="label text-muted-foreground">{product.category}</span>}

              <h1 className="font-bold mt-3 leading-none font-sans text-2xl">
                {product.name}
              </h1>
              <p className="label text-muted-foreground mt-3">{product.code}</p>
              <p className="mt-6 font-sans font-normal">{formatPrice(product.price)}</p>

              <p className="text-muted-foreground mt-8 max-w-md" style={{ fontSize: 15, lineHeight: 1.7 }}>
                {product.description}
              </p>

              {/* SIZE SELECTOR */}
              <div className="mt-10">
                <p className="label mb-4">Tamanho EU</p>
                <div className="grid grid-cols-6 gap-2 max-w-md">
                  {Array.from({ length: 11 }, (_, i) => 36 + i).map((n) => {
                    const available = product.sizes.includes(n);
                    const selected = size === n;
                    return (
                      <button
                        key={n}
                        disabled={!available}
                        onClick={() => setSize(n)}
                        className="font-display text-lg transition-colors"
                        style={{
                          padding: "12px 0",
                          border: "1px solid hsl(var(--border))",
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

              {/* CTAS */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md">
                <button
                  onClick={handleAdd}
                  disabled={!size}
                  className="flex-1 bg-foreground text-background label py-4 disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleWhats}
                  className="flex-1 label py-4 transition-colors hover:bg-foreground hover:text-background"
                  style={{ border: "1px solid hsl(var(--foreground))" }}
                >
                  Falar no WhatsApp
                </button>
              </div>

              {/* DETAILS */}
              <ul className="mt-12 max-w-md">
                {product.details.map((d, i) => (
                  <li
                    key={i}
                    className="flex justify-between py-4"
                    style={{ borderBottom: "1px solid hsl(var(--border))", borderTop: i === 0 ? "1px solid hsl(var(--border))" : "none", fontSize: 14 }}
                  >
                    <span className="label text-muted-foreground">Detalhe {String(i + 1).padStart(2, "0")}</span>
                    <span style={{ textAlign: "right" }}>{d}</span>
                  </li>
                ))}
              </ul>

              {/* PAYMENT */}
              <div className="mt-10 max-w-md p-5" style={{ background: "hsl(var(--secondary))" }}>
                <p className="label mb-2">Pagamento</p>
                <p style={{ fontSize: 14 }}>Pix · Mercado Pago · Crypto. Envio para todo o Brasil.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
