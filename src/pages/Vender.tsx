import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/i18n/I18nContext";
import { supabase } from "@/integrations/supabase/client";

const conditionKeys = ["likeNew", "veryGood", "good", "fair"] as const;
type CondKey = typeof conditionKeys[number];

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
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState<CondKey | "">("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !size || !condition || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "sell-request-email",
        {
          body: {
            name,
            model,
            size,
            condition: t(`vender.cond.${condition}`),
            price,
            description,
          },
        }
      );

      if (invokeError || !data?.ok) {
        throw new Error(invokeError?.message || "send_failed");
      }
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(t("vender.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Layout>
        <section className="px-6 py-40 text-center">
          <p className="font-display italic mx-auto max-w-3xl" style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.2 }}>
            {t("vender.sent")}
          </p>
          <button onClick={() => { setSent(false); setName(""); setModel(""); setSize(""); setCondition(""); setPrice(""); setDescription(""); }} className="underline-link label mt-12">
            {t("vender.sendAnother")}
          </button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="px-6 pt-10 md:pt-14 pb-10" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="mx-auto max-w-[1480px]">
          <span className="label text-muted-foreground">{t("vender.tag")}</span>
          <h1 className="font-display font-black mt-6 leading-[0.95]" style={{ fontSize: "clamp(56px, 11vw, 180px)" }}>
            {t("vender.title1")}
            <br />
            <span className="italic">{t("vender.title2")}</span>
          </h1>
          <p className="mt-10 max-w-2xl text-muted-foreground" style={{ fontSize: 15, lineHeight: 1.7 }}>
            {t("vender.intro")}
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-12">
          <div>
            <label className="label block mb-2">{t("vender.fullName")}</label>
            <input style={underlineInput} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-2">{t("vender.model")}</label>
            <input style={underlineInput} placeholder="Ex.: M.WALL006-S3" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-2">{t("vender.sizeEU")}</label>
            <input style={underlineInput} type="number" min={30} max={50} value={size} onChange={(e) => setSize(e.target.value)} required />
          </div>

          <div>
            <label className="label block mb-4">{t("vender.condition")}</label>
            <div className="flex flex-wrap gap-2">
              {conditionKeys.map((c) => {
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
                    {t(`vender.cond.${c}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label block mb-2">{t("vender.price")}</label>
            <input style={underlineInput} placeholder={t("vender.pricePlaceholder")} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div>
            <label className="label block mb-2">{t("vender.description")}</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...underlineInput, resize: "vertical" }}
              placeholder={t("vender.descriptionPlaceholder")}
            />
          </div>

          <div className="p-5" style={{ background: "hsl(var(--secondary))" }}>
            <p className="label mb-2">{t("vender.tip")}</p>
            <p style={{ fontSize: 14 }}>
              {t("vender.tipBody")}
            </p>
          </div>

          {error && (
            <p className="label" style={{ color: "hsl(var(--destructive))" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background label py-5 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? t("vender.sending") : t("vender.submit")}
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default Vender;
