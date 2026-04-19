import { useState } from "react";
import Layout from "@/components/Layout";
import { WHATSAPP_NUMBER } from "@/data/products";

const conditions = ["Como novo", "Muito bom", "Bom", "Regular"] as const;
type Condition = typeof conditions[number];

const underlineInput: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid hsl(var(--border))",
  borderRadius: 0,
  padding: "12px 0",
  width: "100%",
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 16,
  color: "hsl(var(--foreground))",
};

const Vender = () => {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !size || !condition) return;

    const priceLine = price.trim()
      ? `*Valor pedido: R$ ${price.trim()}*`
      : `*Valor em aberto — aceito oferta*`;

    const msg = `Olá Kaique! Quero vender minha New Rock pela Pedra Nova.\n\n*Nome:* ${name}\n*Modelo:* ${model}\n*Tamanho:* ${size}\n*Condição:* ${condition}\n${priceLine}\n\n${description || ""}\n\nPosso enviar fotos para avaliação!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  if (sent) {
    return (
      <Layout>
        <section className="px-6 py-40 text-center">
          <p className="font-display italic mx-auto max-w-3xl" style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.2 }}>
            Mensagem enviada. O Kaique entra em contato em breve.
          </p>
          <button onClick={() => setSent(false)} className="underline-link label mt-12">
            Enviar outra
          </button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="px-6 pt-20 md:pt-28 pb-20" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">Pedra Nova · Compramos sua New Rock</span>
          <h1 className="font-display font-black mt-6 leading-[0.95]" style={{ fontSize: "clamp(56px, 11vw, 180px)" }}>
            Sua New Rock
            <br />
            <span className="italic">merece nova rua.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-muted-foreground" style={{ fontSize: 15, lineHeight: 1.7 }}>
            Couro legítimo não envelhece — só ganha história. Preencha abaixo e o WhatsApp abre com sua mensagem pronta.
            O Kaique avalia, faz uma oferta justa e fecha direto com você. Sem intermediários. Sem burocracia.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-12">
          <div>
            <label className="label block mb-2">Nome completo</label>
            <input style={underlineInput} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-2">Modelo da New Rock</label>
            <input style={underlineInput} placeholder="Ex.: M.WALL006-S3" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-2">Tamanho EU</label>
            <input style={underlineInput} type="number" min={30} max={50} value={size} onChange={(e) => setSize(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-4">Condição</label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => {
                const sel = condition === c;
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCondition(c)}
                    className="label transition-colors"
                    style={{
                      padding: "10px 18px",
                      border: "1px solid hsl(var(--foreground))",
                      borderRadius: 999,
                      background: sel ? "hsl(var(--foreground))" : "transparent",
                      color: sel ? "hsl(var(--background))" : "hsl(var(--foreground))",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label block mb-2">Valor pedido (R$)</label>
            <input style={underlineInput} placeholder="Deixe em branco se aceitar oferta" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div>
            <label className="label block mb-2">Descrição</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...underlineInput, resize: "vertical" }}
              placeholder="Conte o histórico, uso, marcas..."
            />
          </div>

          <div className="p-5" style={{ background: "hsl(var(--secondary))" }}>
            <p className="label mb-2">Dica</p>
            <p style={{ fontSize: 14 }}>
              Foto vende. Após enviar, mande as imagens da bota pelo WhatsApp — luz natural, sola, fivelas e detalhes.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-foreground text-background label py-5 hover:opacity-90 transition-opacity"
          >
            Enviar para WhatsApp
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default Vender;
