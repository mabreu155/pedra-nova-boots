// ============================================================
// APPLE_PAY_GOOGLE_PAY_INTEGRATION
// Express payment section (Apple Pay / Google Pay) lives at the top
// of the payment step. Toggle via VITE_FEATURE_EXPRESS_PAYMENTS
// and configure VITE_STRIPE_PUBLIC_KEY. See ExpressPayments.tsx.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ChevronLeft, CreditCard, Lock, Copy, Loader2, Upload, Zap, Link as LinkIcon } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";
import ExpressPayments from "./ExpressPayments";
import { createShopifyCheckoutMulti, validateShopifyDiscount } from "@/lib/shopify";
import {
  PIX_KEY_PLACEHOLDER,
  OWNER_EMAIL_PLACEHOLDER,
  CRYPTO_WALLETS,
  COINGECKO_IDS,
  type CryptoSymbol,
} from "@/lib/checkoutConfig";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "sonner";

export type CheckoutItem = { product: Product; size: number; qty: number };

type Props = {
  open: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  onSuccess?: () => void;
};

type Step = "payment" | "review" | "done";

type PaymentMethod =
  | "card"
  | "mp_parcelado"
  | "apple_pay"
  | "paypal"
  | "pix"
  | "crypto";


// Detecta Apple Pay sem disparar prompt (apenas verifica presença)
const isApplePayAvailable = () => {
  if (typeof window === "undefined") return false;
  return !!(window as any).ApplePaySession;
};

const SHOPIFY_METHODS: PaymentMethod[] = [
  "card",
  "mp_parcelado",
  "apple_pay",
  "paypal",
];

const CheckoutModal = ({ open, onClose, items, onSuccess }: Props) => {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("payment");
  const [address, setAddress] = useState({
    name: "", street: "", number: "", complement: "",
    city: "", state: "", zip: "", phone: "",
  });
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [installments, setInstallments] = useState(1);

  // Pix
  const [pixEmail, setPixEmail] = useState("");
  const [pixReceipt, setPixReceipt] = useState<File | null>(null);

  // Crypto
  const [cryptoSymbol, setCryptoSymbol] = useState<CryptoSymbol>("BTC");
  const [cryptoEmail, setCryptoEmail] = useState("");
  const [cryptoTxid, setCryptoTxid] = useState("");
  const [cryptoRate, setCryptoRate] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string>("");

  // Cupom de desconto (validado pela Shopify Storefront API)
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discountAmount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const buildLines = () => {
    const lines: Array<{ variantId: string; quantity: number }> = [];
    for (const it of items) {
      const variantId = it.product.variantIdBySize?.[it.size];
      if (variantId) lines.push({ variantId, quantity: it.qty });
    }
    return lines;
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    const lines = buildLines();
    const res = await validateShopifyDiscount(lines, code);
    setCouponLoading(false);
    if (res.ok === true) {
      setCoupon({ code: res.code, discount: res.discount });
      toast.success(`Cupom "${res.code}" aplicado`);
      return;
    }
    setCoupon(null);
    const msg =
      res.reason === "not_applicable"
        ? "Cupom inválido ou não aplicável a este carrinho"
        : res.message || "Erro ao validar cupom";
    setCouponError(msg);
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // Re-valida quando items mudam (preço/tamanho diferente pode invalidar mínimos)
  useEffect(() => {
    if (!coupon) return;
    const lines = buildLines();
    if (lines.length === 0) return;
    validateShopifyDiscount(lines, coupon.code).then((res) => {
      if (res.ok) setCoupon({ code: res.code, discount: res.discount });
      else setCoupon(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Cota crypto (CoinGecko, sem chave)
  useEffect(() => {
    if (method !== "crypto") return;
    let cancel = false;
    const id = COINGECKO_IDS[cryptoSymbol];
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=brl`)
      .then((r) => r.json())
      .then((d) => {
        if (cancel) return;
        const rate = d?.[id]?.brl;
        setCryptoRate(typeof rate === "number" ? rate : null);
      })
      .catch(() => !cancel && setCryptoRate(null));
    return () => { cancel = true; };
  }, [method, cryptoSymbol]);

  const cryptoAmount = useMemo(() => {
    if (!cryptoRate) return null;
    const amt = total / cryptoRate;
    return amt.toFixed(cryptoSymbol === "BTC" ? 8 : 6);
  }, [cryptoRate, total, cryptoSymbol]);

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep("payment");
      setSubmitError(null);
      setSubmitting(false);
    }, 300);
  };

  const back = () => {
    if (step === "review") setStep("payment");
  };

  const addressValid =
    address.name && address.street && address.number && address.city && address.state && address.zip && address.phone;

  const deliveryValid = addressValid;

  const paymentValid = (() => {
    switch (method) {
      case "card": return !!(card.number && card.name && card.exp && card.cvv);
      case "pix": return !!(pixEmail && pixReceipt && addressValid);
      case "crypto": return !!(cryptoEmail && cryptoTxid && addressValid);
      default: return true;
    }
  })();

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const result = r.result as string;
        const idx = result.indexOf(",");
        resolve(idx >= 0 ? result.slice(idx + 1) : result);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handlePay = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Métodos Shopify → cria cart e redireciona no mesmo tab
      if (SHOPIFY_METHODS.includes(method)) {
        if (items.length === 0) throw new Error(t("co.err.emptyCart"));
        const lines: Array<{ variantId: string; quantity: number }> = [];
        for (const it of items) {
          const variantId = it.product.variantIdBySize?.[it.size];
          if (!variantId) {
            throw new Error(
              `"${it.product.name}" (${t("co.tamEU")} ${it.size}) ${t("co.err.notSynced")}`
            );
          }
          lines.push({ variantId, quantity: it.qty });
        }
        const checkoutUrl = await createShopifyCheckoutMulti(lines, coupon?.code);
        if (!checkoutUrl) throw new Error(t("co.err.createCheckout"));

        setDoneMessage(t("co.done.redirect"));
        setStep("done");
        onSuccess?.();
        setTimeout(() => { window.location.href = checkoutUrl; }, 1200);
        return;
      }

      const fullAddress = `${address.street}, ${address.number}${address.complement ? " — " + address.complement : ""}, ${address.city}/${address.state} · ${address.zip} · ${address.phone}`;
      const itemsSummary = items
        .map((i) => `${i.product.name} (${i.product.code}) — Tam ${i.size} × ${i.qty}`)
        .join(" | ");
      const firstItem = items[0];

      if (method === "pix") {
        const receiptBase64 = pixReceipt ? await fileToBase64(pixReceipt) : "";
        const { error } = await supabase.functions.invoke("manual-order-email", {
          body: {
            type: "pix",
            ownerEmail: OWNER_EMAIL_PLACEHOLDER,
            customerEmail: pixEmail,
            customerName: address.name,
            address: fullAddress,
            productName: firstItem?.product.name,
            productCode: firstItem?.product.code,
            size: firstItem?.size,
            itemsSummary,
            totalBRL: total,
            couponCode: coupon?.code,
            couponDiscountBRL: discountAmount || undefined,
            subtotalBRL: subtotal,
            receipt: pixReceipt
              ? { filename: pixReceipt.name, base64: receiptBase64, mime: pixReceipt.type }
              : undefined,
          },
        });
        if (error) throw new Error(error.message);
        setDoneMessage(t("co.done.pix"));
        setStep("done");
        onSuccess?.();
        return;
      }

      if (method === "crypto") {
        const { error } = await supabase.functions.invoke("manual-order-email", {
          body: {
            type: "crypto",
            ownerEmail: OWNER_EMAIL_PLACEHOLDER,
            customerEmail: cryptoEmail,
            customerName: address.name,
            address: fullAddress,
            productName: firstItem?.product.name,
            productCode: firstItem?.product.code,
            size: firstItem?.size,
            itemsSummary,
            totalBRL: total,
            couponCode: coupon?.code,
            couponDiscountBRL: discountAmount || undefined,
            subtotalBRL: subtotal,
            cryptoSymbol,
            cryptoAmount: cryptoAmount ?? "—",
            txid: cryptoTxid,
          },
        });
        if (error) throw new Error(error.message);
        setDoneMessage(t("co.done.crypto"));
        setStep("done");
        onSuccess?.();
        return;
      }
    } catch (e: any) {
      const msg = e?.message ?? t("co.err.generic");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const ctaLabel = (() => {
    if (step === "payment") return t("co.cta.payment");
    if (step === "review") return submitting ? t("co.cta.processing") : `${t("co.cta.pay")} ${formatPrice(total)}`;
    return "";
  })();

  const onPrimary = () => {
    if (step === "payment") setStep("review");
    else if (step === "review") handlePay();
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(13,13,13,0.5)", backdropFilter: "blur(6px)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center pointer-events-none p-0 md:p-6"
          >
            <div
              className="bg-background w-full h-[100dvh] md:h-auto md:max-h-[92vh] md:max-w-[920px] pointer-events-auto flex flex-col md:flex-row overflow-hidden md:rounded-[12px] md:border md:border-border"
            >
              {/* HEADER mobile */}
              <div
                className="flex items-center justify-between px-4 md:hidden shrink-0"
                style={{ height: 56, borderBottom: "1px solid hsl(var(--border))" }}
              >
                <button onClick={step === "payment" || step === "done" ? close : back} aria-label={t("co.back")}>
                  {step === "payment" || step === "done" ? <X size={20} /> : <ChevronLeft size={20} />}
                </button>
                <span className="font-sans font-semibold text-sm">
                  {step === "payment" && t("co.step.payment")}
                  {step === "review" && t("co.step.review")}
                  {step === "done" && t("co.step.done")}
                </span>
                <span style={{ width: 20 }} />
              </div>

              {/* Single scroll on mobile; splits into two columns on desktop */}
              <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden md:flex md:flex-row">
              {/* LEFT — form */}
              <div className="md:flex-1 md:overflow-y-auto p-5 md:p-8">
                {/* Stepper desktop */}
                <div className="hidden md:flex items-center justify-between mb-6">
                  <button
                    onClick={step === "payment" || step === "done" ? close : back}
                    className="flex items-center gap-1 font-sans text-sm hover:underline"
                  >
                    {step === "payment" || step === "done" ? <X size={16} /> : <ChevronLeft size={16} />}
                    {step === "payment" || step === "done" ? t("co.close") : t("co.back")}
                  </button>
                  <div className="flex items-center gap-2">
                    {(["payment", "review"] as Step[]).map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-sans text-xs font-semibold"
                          style={{
                            background:
                              step === s || (step === "review" && s === "payment") || step === "done"
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--secondary))",
                            color:
                              step === s || (step === "review" && s === "payment") || step === "done"
                                ? "hsl(var(--background))"
                                : "hsl(var(--foreground))",
                          }}
                        >
                          {i + 1}
                        </div>
                        {i < 1 && <div className="w-8 h-px bg-border" />}
                      </div>
                    ))}
                  </div>
                </div>


                {step === "payment" && (
                  <div className="space-y-4">
                    <h2 className="font-sans font-bold text-xl">{t("co.paymentTitle")}</h2>

                    <ExpressPayments amountBRL={total} />

                    <div className="grid grid-cols-2 gap-2">
                      <MethodTile active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard size={16} />} label={t("co.m.card")} />
                      <MethodTile active={method === "mp_parcelado"} onClick={() => setMethod("mp_parcelado")} icon={<span className="font-bold text-xs">12x</span>} label={t("co.m.installments")} />
                      {isApplePayAvailable() && (
                        <MethodTile active={method === "apple_pay"} onClick={() => setMethod("apple_pay")} icon={<span className="font-bold text-xs"></span>} label={t("co.m.applePay")} />
                      )}
                      <MethodTile active={method === "paypal"} onClick={() => setMethod("paypal")} icon={<span className="font-bold text-xs">P</span>} label={t("co.m.paypal")} />
                      <MethodTile active={method === "pix"} onClick={() => setMethod("pix")} icon={<span className="font-bold text-xs">PIX</span>} label="Pix" />
                      <MethodTile active={method === "crypto"} onClick={() => setMethod("crypto")} icon={<LinkIcon size={14} />} label="Crypto" />

                    </div>

                    {method === "card" && (
                      <div className="space-y-4 pt-2">
                        <Field label={t("co.f.cardNumber")} value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="0000 0000 0000 0000" />
                        <Field label={t("co.f.cardName")} value={card.name} onChange={(v) => setCard({ ...card, name: v })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label={t("co.f.cardExp")} value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} placeholder="MM/AA" />
                          <Field label={t("co.f.cardCvv")} value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="123" />
                        </div>
                        <InfoBox>{t("co.info.card")}</InfoBox>
                      </div>
                    )}


                    {method === "mp_parcelado" && (
                      <div className="space-y-3 pt-2">
                        <label className="block">
                          <span className="label block mb-1.5" style={{ fontSize: 11 }}>{t("co.f.installments")}</span>
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            className="w-full font-sans text-sm bg-background"
                            style={{ padding: "10px 12px", border: "1px solid hsl(var(--border))", borderRadius: 6, outline: "none" }}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}x de {formatPrice(Math.round(total / n))}
                              </option>
                            ))}
                          </select>
                        </label>
                        <InfoBox>{t("co.info.installments")}</InfoBox>
                      </div>
                    )}

                    {method === "apple_pay" && (
                      <InfoBox>{t("co.info.applePay")}</InfoBox>
                    )}

                    {method === "paypal" && (
                      <InfoBox>{t("co.info.paypal")}</InfoBox>
                    )}




                    {method === "pix" && (
                      <div className="space-y-3 pt-2">
                        <div className="p-4 font-sans text-sm space-y-2" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
                          <p className="font-semibold flex items-center gap-1.5"><Zap size={14} />{t("co.pix.title")}</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs">{t("co.pix.key")}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(PIX_KEY_PLACEHOLDER)}
                              className="font-mono text-xs flex items-center gap-1 hover:underline"
                            >
                              {PIX_KEY_PLACEHOLDER} <Copy size={12} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">{t("co.pix.amount")}</span>
                            <span className="font-semibold">{formatPrice(total)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2">{t("co.pix.note")}</p>
                        </div>
                        <Field label={t("co.f.email")} value={pixEmail} onChange={setPixEmail} placeholder="voce@email.com" />
                        <FileField label={t("co.pix.receipt")} file={pixReceipt} onChange={setPixReceipt} />
                        <AddressFields t={t} address={address} setAddress={setAddress} />
                      </div>
                    )}

                    {method === "crypto" && (
                      <div className="space-y-3 pt-2">
                        <div className="p-4 font-sans text-sm space-y-3" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
                          <p className="font-semibold flex items-center gap-1.5"><LinkIcon size={14} />{t("co.crypto.title")}</p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {(["BTC", "ETH", "USDT", "SOL", "LTC"] as CryptoSymbol[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => setCryptoSymbol(s)}
                                className="font-sans text-xs font-semibold py-2"
                                style={{
                                  border: `1px solid ${cryptoSymbol === s ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
                                  borderRadius: 6,
                                  background: cryptoSymbol === s ? "hsl(var(--foreground))" : "transparent",
                                  color: cryptoSymbol === s ? "hsl(var(--background))" : "hsl(var(--foreground))",
                                }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs">{t("co.crypto.address")}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(CRYPTO_WALLETS[cryptoSymbol])}
                              className="font-mono text-[10px] flex items-center gap-1 hover:underline truncate max-w-[220px]"
                              title={CRYPTO_WALLETS[cryptoSymbol]}
                            >
                              {CRYPTO_WALLETS[cryptoSymbol]} <Copy size={12} className="shrink-0" />
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <img
                              alt={`QR ${cryptoSymbol}`}
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(CRYPTO_WALLETS[cryptoSymbol])}`}
                              style={{ borderRadius: 6, background: "hsl(var(--background))", padding: 4 }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">{t("co.crypto.approx")}</span>
                            <span className="font-mono text-xs font-semibold">
                              {cryptoAmount ? `${cryptoAmount} ${cryptoSymbol}` : t("co.crypto.calc")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">{t("co.crypto.totalBrl")}</span>
                            <span className="font-semibold">{formatPrice(total)}</span>
                          </div>
                        </div>
                        <Field label={t("co.f.email")} value={cryptoEmail} onChange={setCryptoEmail} placeholder="voce@email.com" />
                        <Field label={t("co.crypto.txid")} value={cryptoTxid} onChange={setCryptoTxid} placeholder="0x… / tx hash" />
                        <AddressFields t={t} address={address} setAddress={setAddress} />
                      </div>
                    )}

                    <div className="flex items-start gap-2 font-sans text-xs text-muted-foreground pt-2">
                      <Lock size={14} className="shrink-0 mt-0.5" />
                      <span>{t("co.secure")}</span>
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="space-y-5">
                    <h2 className="font-sans font-bold text-xl">{t("co.step.review")}</h2>

                    {(method === "pix" || method === "crypto") && (
                      <ReviewBlock title={t("co.review.deliverTo")} editLabel={t("co.review.edit")} onEdit={() => setStep("payment")}>
                        <p className="font-sans text-sm">{address.name}</p>
                        <p className="font-sans text-sm text-muted-foreground">
                          {address.street}, {address.number}
                          {address.complement ? ` — ${address.complement}` : ""}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">
                          {address.city} / {address.state} · {address.zip}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">{address.phone}</p>
                      </ReviewBlock>
                    )}

                    <ReviewBlock title={t("co.review.payment")} editLabel={t("co.review.edit")} onEdit={() => setStep("payment")}>
                      <p className="font-sans text-sm">{paymentLabel(method, card, installments, cryptoSymbol)}</p>
                    </ReviewBlock>

                    {submitError && (
                      <div className="p-3 font-sans text-xs" style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--destructive))" }}>
                        {submitError}
                      </div>
                    )}

                  </div>
                )}

                {step === "done" && (
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: "hsl(var(--secondary))" }}
                    >
                      <ShieldCheck size={28} />
                    </div>
                    <h2 className="font-sans font-bold text-xl mb-2">{t("co.done.title")}</h2>
                    <p className="font-sans text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      {doneMessage}
                    </p>
                    <button
                      onClick={close}
                      className="bg-foreground text-background font-sans font-semibold text-sm px-6 py-3"
                      style={{ borderRadius: 8 }}
                    >
                      {t("co.done.continue")}
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT — order summary */}
              {step !== "done" && (
                <aside
                  className="w-full md:w-[340px] md:overflow-y-auto p-5 md:p-6 flex flex-col"
                  style={{ background: "hsl(var(--secondary))", borderTop: "1px solid hsl(var(--border))" }}
                >
                  <p className="label mb-4" style={{ fontSize: 11 }}>{t("co.summary")}</p>

                  <ul className="space-y-3 mb-5">
                    {items.map((it, idx) => (
                      <li key={`${it.product.slug}-${it.size}-${idx}`} className="flex gap-3">
                        <div style={{ width: 64, flexShrink: 0 }}>
                          <ProductImage src={it.product.image} name={it.product.name} ratio="1/1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-semibold text-sm leading-tight truncate">{it.product.name}</p>
                          <p className="font-sans text-xs text-muted-foreground mt-1">{it.product.code}</p>
                          <p className="font-sans text-xs text-muted-foreground">{t("co.tamEU")} {it.size}{it.qty > 1 ? ` · ${it.qty}×` : ""}</p>
                          <p className="font-sans font-semibold text-sm mt-1">{formatPrice(it.product.price * it.qty)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Coupon */}
                  <div className="py-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    {coupon ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-sans text-sm">
                          <span className="font-semibold">Cupom:</span>{" "}
                          <span className="font-mono text-xs px-2 py-1" style={{ background: "hsl(var(--background))", borderRadius: 4 }}>
                            {coupon.code}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="font-sans text-xs underline text-muted-foreground hover:text-foreground"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                            placeholder="Código de desconto"
                            className="flex-1 font-sans text-sm bg-background uppercase"
                            style={{ padding: "8px 10px", border: "1px solid hsl(var(--border))", borderRadius: 6, outline: "none" }}
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={!couponInput.trim() || couponLoading}
                            className="font-sans font-semibold text-xs px-3 disabled:opacity-40 flex items-center gap-1.5"
                            style={{ border: "1px solid hsl(var(--foreground))", borderRadius: 6 }}
                          >
                            {couponLoading && <Loader2 size={12} className="animate-spin" />}
                            Aplicar
                          </button>
                        </div>
                        {couponError && (
                          <p className="font-sans text-xs" style={{ color: "hsl(var(--destructive))" }}>{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 font-sans text-sm py-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <Row label={t("co.subtotal")} value={formatPrice(subtotal)} />
                    {coupon && discountAmount > 0 && (
                      <Row
                        label={`Desconto (${coupon.code})`}
                        value={<span style={{ color: "hsl(var(--destructive))" }}>−{formatPrice(discountAmount)}</span>}
                      />
                    )}
                    <Row label={t("co.shipping")} value={<span className="text-muted-foreground">{t("co.shippingCalc")}</span>} />
                  </div>

                  <div
                    className="flex items-baseline justify-between font-sans font-bold pt-4"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                  >
                    <span>{t("co.total")}</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>

                  <button
                    onClick={onPrimary}
                    disabled={
                      (step === "payment" && !paymentValid) ||
                      (step === "review" && submitting)
                    }
                    className="w-full bg-foreground text-background font-sans font-semibold text-sm py-3.5 mt-5 disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ borderRadius: 8 }}
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {ctaLabel}
                  </button>

                  <p className="font-sans text-xs text-muted-foreground text-center mt-3">
                    {t("co.terms")}
                  </p>
                </aside>
              )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const paymentLabel = (
  m: PaymentMethod,
  card: { number: string },
  installments: number,
  crypto: CryptoSymbol,
): string => {
  switch (m) {
    case "card": return `Cartão final ${card.number.replace(/\s/g, "").slice(-4) || "••••"}`;
    case "mp_parcelado": return `Mercado Pago — ${installments}x`;
    case "apple_pay": return "Apple Pay";
    case "paypal": return "PayPal";
    case "pix": return "Pix";
    case "crypto": return `Crypto — ${crypto}`;
  }
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <label className="block">
    <span className="label block mb-1.5" style={{ fontSize: 11 }}>{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full font-sans text-sm bg-background"
      style={{ padding: "10px 12px", border: "1px solid hsl(var(--border))", borderRadius: 6, outline: "none" }}
    />
  </label>
);

const FileField = ({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) => (
  <label className="block">
    <span className="label block mb-1.5" style={{ fontSize: 11 }}>{label}</span>
    <div
      className="w-full font-sans text-sm bg-background flex items-center gap-2 cursor-pointer"
      style={{ padding: "10px 12px", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
    >
      <Upload size={14} />
      <span className="truncate">{file ? file.name : "—"}</span>
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  </label>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 font-sans text-sm" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
    {children}
  </div>
);

const MethodTile = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 font-sans font-semibold text-sm py-3 transition-colors"
    style={{
      border: `1px solid ${active ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
      borderRadius: 8,
      background: active ? "hsl(var(--secondary))" : "transparent",
    }}
  >
    {icon}
    {label}
  </button>
);

const ReviewBlock = ({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: React.ReactNode }) => (
  <div className="p-4" style={{ border: "1px solid hsl(var(--border))", borderRadius: 8 }}>
    <div className="flex items-center justify-between mb-2">
      <p className="label" style={{ fontSize: 11 }}>{title}</p>
      <button onClick={onEdit} className="font-sans text-xs underline">{editLabel}</button>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

type AddressState = {
  name: string; street: string; number: string; complement: string;
  city: string; state: string; zip: string; phone: string;
};

const AddressFields = ({
  t, address, setAddress,
}: {
  t: (k: string) => string;
  address: AddressState;
  setAddress: (a: AddressState) => void;
}) => (
  <div className="space-y-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
    <p className="label pt-2" style={{ fontSize: 11 }}>{t("co.deliveryTitle")}</p>
    <Field label={t("co.f.name")} value={address.name} onChange={(v) => setAddress({ ...address, name: v })} />
    <div className="grid grid-cols-[1fr_120px] gap-3">
      <Field label={t("co.f.street")} value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
      <Field label={t("co.f.number")} value={address.number} onChange={(v) => setAddress({ ...address, number: v })} />
    </div>
    <Field label={t("co.f.complement")} value={address.complement} onChange={(v) => setAddress({ ...address, complement: v })} />
    <div className="grid grid-cols-[1fr_120px_140px] gap-3">
      <Field label={t("co.f.city")} value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
      <Field label={t("co.f.state")} value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
      <Field label={t("co.f.zip")} value={address.zip} onChange={(v) => setAddress({ ...address, zip: v })} />
    </div>
    <Field label={t("co.f.phone")} value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
  </div>
);

export default CheckoutModal;
