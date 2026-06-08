import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ChevronLeft, CreditCard, Lock, Copy, Loader2, Upload } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";
import { createShopifyCheckout } from "@/lib/shopify";
import {
  PIX_KEY_PLACEHOLDER,
  OWNER_EMAIL_PLACEHOLDER,
  CRYPTO_WALLETS,
  COINGECKO_IDS,
  type CryptoSymbol,
} from "@/lib/checkoutConfig";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: number | null;
};

type Step = "delivery" | "payment" | "review" | "done";

type PaymentMethod =
  | "card"
  | "pix_mp"
  | "mp_parcelado"
  | "apple_pay"
  | "paypal"
  | "crypto_nowpayments"
  | "pix_direto"
  | "crypto_direto";

const SHIPPING = 39;
const BUYER_PROTECTION_PCT = 0.045;

// Detecta Apple Pay sem disparar prompt (apenas verifica presença)
const isApplePayAvailable = () => {
  if (typeof window === "undefined") return false;
  return !!(window as any).ApplePaySession;
};

const SHOPIFY_METHODS: PaymentMethod[] = [
  "card",
  "pix_mp",
  "mp_parcelado",
  "apple_pay",
  "paypal",
  "crypto_nowpayments",
];

const CheckoutModal = ({ open, onClose, product, size }: Props) => {
  const [step, setStep] = useState<Step>("delivery");
  const [address, setAddress] = useState({
    name: "", street: "", number: "", complement: "",
    city: "", state: "", zip: "", phone: "",
  });
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [installments, setInstallments] = useState(1);

  // Pix Direto
  const [pixEmail, setPixEmail] = useState("");
  const [pixReceipt, setPixReceipt] = useState<File | null>(null);

  // Crypto Direto
  const [cryptoSymbol, setCryptoSymbol] = useState<CryptoSymbol>("BTC");
  const [cryptoEmail, setCryptoEmail] = useState("");
  const [cryptoTxid, setCryptoTxid] = useState("");
  const [cryptoRate, setCryptoRate] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string>("");

  const subtotal = product.price;
  const protection = Math.round(subtotal * BUYER_PROTECTION_PCT);
  const total = subtotal + SHIPPING + protection;

  // Cota crypto (CoinGecko, sem chave)
  useEffect(() => {
    if (method !== "crypto_direto") return;
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
      setStep("delivery");
      setSubmitError(null);
      setSubmitting(false);
    }, 300);
  };

  const back = () => {
    if (step === "payment") setStep("delivery");
    else if (step === "review") setStep("payment");
  };

  const deliveryValid =
    address.name && address.street && address.number && address.city && address.state && address.zip && address.phone;

  const paymentValid = (() => {
    switch (method) {
      case "card": return !!(card.number && card.name && card.exp && card.cvv);
      case "pix_direto": return !!(pixEmail && pixReceipt);
      case "crypto_direto": return !!(cryptoEmail && cryptoTxid);
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
        if (!size) throw new Error("Selecione um tamanho.");
        const variantId = product.variantIdBySize?.[size];
        if (!variantId) {
          throw new Error(
            "Esta variante ainda não está sincronizada com o Shopify. Use Pix Direto ou Crypto Direto, ou peça ao admin para mapear o produto."
          );
        }
        const checkoutUrl = await createShopifyCheckout(variantId, 1);
        if (!checkoutUrl) throw new Error("Falha ao criar checkout Shopify. Tente novamente.");

        setDoneMessage("Você será redirecionado para finalizar o pagamento em segurança.");
        setStep("done");
        // pequeno delay para mostrar a confirmação antes de redirecionar
        setTimeout(() => { window.location.href = checkoutUrl; }, 1200);
        return;
      }

      const fullAddress = `${address.street}, ${address.number}${address.complement ? " — " + address.complement : ""}, ${address.city}/${address.state} · ${address.zip} · ${address.phone}`;

      if (method === "pix_direto") {
        const receiptBase64 = pixReceipt ? await fileToBase64(pixReceipt) : "";
        const { error } = await supabase.functions.invoke("manual-order-email", {
          body: {
            type: "pix",
            ownerEmail: OWNER_EMAIL_PLACEHOLDER,
            customerEmail: pixEmail,
            customerName: address.name,
            address: fullAddress,
            productName: product.name,
            productCode: product.code,
            size,
            totalBRL: total,
            receipt: pixReceipt
              ? { filename: pixReceipt.name, base64: receiptBase64, mime: pixReceipt.type }
              : undefined,
          },
        });
        if (error) throw new Error(error.message);
        setDoneMessage("Enviaremos a confirmação assim que identificarmos o pagamento. Prazo: até 2 horas úteis.");
        setStep("done");
        return;
      }

      if (method === "crypto_direto") {
        const { error } = await supabase.functions.invoke("manual-order-email", {
          body: {
            type: "crypto",
            ownerEmail: OWNER_EMAIL_PLACEHOLDER,
            customerEmail: cryptoEmail,
            customerName: address.name,
            address: fullAddress,
            productName: product.name,
            productCode: product.code,
            size,
            totalBRL: total,
            cryptoSymbol,
            cryptoAmount: cryptoAmount ?? "—",
            txid: cryptoTxid,
          },
        });
        if (error) throw new Error(error.message);
        setDoneMessage("Verificaremos a transação on-chain e confirmaremos o envio em até 4 horas úteis.");
        setStep("done");
        return;
      }
    } catch (e: any) {
      setSubmitError(e?.message ?? "Erro ao processar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const ctaLabel = (() => {
    if (step === "delivery") return "Continuar para pagamento";
    if (step === "payment") return "Revisar pedido";
    if (step === "review") return submitting ? "Processando…" : `Pagar ${formatPrice(total)}`;
    return "";
  })();

  const onPrimary = () => {
    if (step === "delivery") setStep("payment");
    else if (step === "payment") setStep("review");
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
                <button onClick={step === "delivery" || step === "done" ? close : back} aria-label="Voltar">
                  {step === "delivery" || step === "done" ? <X size={20} /> : <ChevronLeft size={20} />}
                </button>
                <span className="font-sans font-semibold text-sm">
                  {step === "delivery" && "Entrega"}
                  {step === "payment" && "Pagamento"}
                  {step === "review" && "Revisar pedido"}
                  {step === "done" && "Pedido confirmado"}
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
                    onClick={step === "delivery" || step === "done" ? close : back}
                    className="flex items-center gap-1 font-sans text-sm hover:underline"
                  >
                    {step === "delivery" || step === "done" ? <X size={16} /> : <ChevronLeft size={16} />}
                    {step === "delivery" || step === "done" ? "Fechar" : "Voltar"}
                  </button>
                  <div className="flex items-center gap-2">
                    {(["delivery", "payment", "review"] as Step[]).map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-sans text-xs font-semibold"
                          style={{
                            background:
                              step === s || (step === "review" && s !== "review") || step === "done"
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--secondary))",
                            color:
                              step === s || (step === "review" && s !== "review") || step === "done"
                                ? "hsl(var(--background))"
                                : "hsl(var(--foreground))",
                          }}
                        >
                          {i + 1}
                        </div>
                        {i < 2 && <div className="w-8 h-px bg-border" />}
                      </div>
                    ))}
                  </div>
                </div>

                {step === "delivery" && (
                  <div className="space-y-4">
                    <h2 className="font-sans font-bold text-xl">Endereço de entrega</h2>
                    <Field label="Nome completo" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} />
                    <div className="grid grid-cols-[1fr_120px] gap-3">
                      <Field label="Rua" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
                      <Field label="Número" value={address.number} onChange={(v) => setAddress({ ...address, number: v })} />
                    </div>
                    <Field label="Complemento (opcional)" value={address.complement} onChange={(v) => setAddress({ ...address, complement: v })} />
                    <div className="grid grid-cols-[1fr_120px_140px] gap-3">
                      <Field label="Cidade" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                      <Field label="UF" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                      <Field label="CEP" value={address.zip} onChange={(v) => setAddress({ ...address, zip: v })} />
                    </div>
                    <Field label="Telefone" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
                  </div>
                )}

                {step === "payment" && (
                  <div className="space-y-4">
                    <h2 className="font-sans font-bold text-xl">Pagamento</h2>

                    <div className="grid grid-cols-2 gap-2">
                      <MethodTile active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard size={16} />} label="Cartão" />
                      <MethodTile active={method === "pix_mp"} onClick={() => setMethod("pix_mp")} icon={<span className="font-bold text-xs">PIX</span>} label="Pix" />
                      <MethodTile active={method === "mp_parcelado"} onClick={() => setMethod("mp_parcelado")} icon={<span className="font-bold text-xs">12x</span>} label="Parcelado" />
                      {isApplePayAvailable() && (
                        <MethodTile active={method === "apple_pay"} onClick={() => setMethod("apple_pay")} icon={<span className="font-bold text-xs"></span>} label="Apple Pay" />
                      )}
                      <MethodTile active={method === "paypal"} onClick={() => setMethod("paypal")} icon={<span className="font-bold text-xs">P</span>} label="PayPal" />
                      <MethodTile active={method === "crypto_nowpayments"} onClick={() => setMethod("crypto_nowpayments")} icon={<span className="font-bold text-xs">₿</span>} label="Crypto" />
                      <MethodTile active={method === "pix_direto"} onClick={() => setMethod("pix_direto")} icon={<span className="font-bold text-xs">⚡</span>} label="Pix Direto" />
                      <MethodTile active={method === "crypto_direto"} onClick={() => setMethod("crypto_direto")} icon={<span className="font-bold text-xs">🔗</span>} label="Crypto Direto" />
                    </div>

                    {method === "card" && (
                      <div className="space-y-4 pt-2">
                        <Field label="Número do cartão" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="0000 0000 0000 0000" />
                        <Field label="Nome no cartão" value={card.name} onChange={(v) => setCard({ ...card, name: v })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Validade" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} placeholder="MM/AA" />
                          <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="123" />
                        </div>
                        <InfoBox>O pagamento com cartão é processado de forma segura via Shopify Checkout.</InfoBox>
                      </div>
                    )}

                    {method === "pix_mp" && (
                      <InfoBox>QR Code Pix gerado via Mercado Pago no checkout Shopify. Confirmação automática após pagamento.</InfoBox>
                    )}

                    {method === "mp_parcelado" && (
                      <div className="space-y-3 pt-2">
                        <label className="block">
                          <span className="label block mb-1.5" style={{ fontSize: 11 }}>Parcelas</span>
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
                        <InfoBox>Parcelamento finalizado no checkout Mercado Pago via Shopify.</InfoBox>
                      </div>
                    )}

                    {method === "apple_pay" && (
                      <InfoBox>Apple Pay processado no checkout Shopify usando seu Wallet do dispositivo.</InfoBox>
                    )}

                    {method === "paypal" && (
                      <InfoBox>Você será direcionado para o PayPal via checkout Shopify.</InfoBox>
                    )}

                    {method === "crypto_nowpayments" && (
                      <InfoBox>Aceita BTC, ETH, USDT, SOL, LTC. Pagamento confirmado on-chain via NOWPayments no checkout Shopify.</InfoBox>
                    )}

                    {method === "pix_direto" && (
                      <div className="space-y-3 pt-2">
                        <div className="p-4 font-sans text-sm space-y-2" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
                          <p className="font-semibold">⚡ Pix Direto — sem taxas</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs">Chave Pix</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(PIX_KEY_PLACEHOLDER)}
                              className="font-mono text-xs flex items-center gap-1 hover:underline"
                            >
                              {PIX_KEY_PLACEHOLDER} <Copy size={12} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Valor</span>
                            <span className="font-semibold">{formatPrice(total)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2">Faça o Pix e envie o comprovativo abaixo.</p>
                        </div>
                        <Field label="Seu e-mail" value={pixEmail} onChange={setPixEmail} placeholder="voce@email.com" />
                        <FileField label="Comprovativo do Pix" file={pixReceipt} onChange={setPixReceipt} />
                      </div>
                    )}

                    {method === "crypto_direto" && (
                      <div className="space-y-3 pt-2">
                        <div className="p-4 font-sans text-sm space-y-3" style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}>
                          <p className="font-semibold">🔗 Crypto Direto — sem taxas de plataforma</p>
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
                            <span className="text-muted-foreground text-xs">Endereço</span>
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
                            <span className="text-muted-foreground text-xs">Valor aproximado</span>
                            <span className="font-mono text-xs font-semibold">
                              {cryptoAmount ? `${cryptoAmount} ${cryptoSymbol}` : "calculando…"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Total BRL</span>
                            <span className="font-semibold">{formatPrice(total)}</span>
                          </div>
                        </div>
                        <Field label="Seu e-mail" value={cryptoEmail} onChange={setCryptoEmail} placeholder="voce@email.com" />
                        <Field label="TXID (hash da transação)" value={cryptoTxid} onChange={setCryptoTxid} placeholder="0x… / tx hash" />
                      </div>
                    )}

                    <div className="flex items-start gap-2 font-sans text-xs text-muted-foreground pt-2">
                      <Lock size={14} className="shrink-0 mt-0.5" />
                      <span>Pagamento processado com criptografia. Seus dados ficam seguros.</span>
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="space-y-5">
                    <h2 className="font-sans font-bold text-xl">Revisar pedido</h2>

                    <ReviewBlock title="Entregar para" onEdit={() => setStep("delivery")}>
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

                    <ReviewBlock title="Pagamento" onEdit={() => setStep("payment")}>
                      <p className="font-sans text-sm">{paymentLabel(method, card, installments, cryptoSymbol)}</p>
                    </ReviewBlock>

                    {submitError && (
                      <div className="p-3 font-sans text-xs" style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--destructive))" }}>
                        {submitError}
                      </div>
                    )}

                    <div
                      className="flex gap-3 p-3"
                      style={{ border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    >
                      <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                      <p className="font-sans text-xs leading-relaxed">
                        Sua compra está coberta pela <span className="font-semibold">Proteção ao Comprador</span> Pedra Nova.
                      </p>
                    </div>
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
                    <h2 className="font-sans font-bold text-xl mb-2">Pedido confirmado.</h2>
                    <p className="font-sans text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      {doneMessage}
                    </p>
                    <button
                      onClick={close}
                      className="bg-foreground text-background font-sans font-semibold text-sm px-6 py-3"
                      style={{ borderRadius: 8 }}
                    >
                      Continuar comprando
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT — order summary */}
              {step !== "done" && (
                <aside
                  className="w-full md:w-[340px] p-5 md:p-6 flex flex-col"
                  style={{ background: "hsl(var(--secondary))", borderTop: "1px solid hsl(var(--border))" }}
                >
                  <p className="label mb-4" style={{ fontSize: 11 }}>Resumo</p>

                  <div className="flex gap-3 mb-5">
                    <div style={{ width: 72, flexShrink: 0 }}>
                      <ProductImage src={product.image} name={product.name} ratio="1/1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm leading-tight truncate">{product.name}</p>
                      <p className="font-sans text-xs text-muted-foreground mt-1">{product.code}</p>
                      <p className="font-sans text-xs text-muted-foreground">Tam EU {size ?? "—"}</p>
                      <p className="font-sans font-semibold text-sm mt-1">{formatPrice(subtotal)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 font-sans text-sm py-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <Row label="Subtotal" value={formatPrice(subtotal)} />
                    <Row label="Frete" value={formatPrice(SHIPPING)} />
                    <Row label="Proteção ao Comprador" value={formatPrice(protection)} />
                  </div>

                  <div
                    className="flex items-baseline justify-between font-sans font-bold pt-4"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                  >
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>

                  <button
                    onClick={onPrimary}
                    disabled={
                      (step === "delivery" && !deliveryValid) ||
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
                    Ao finalizar, você aceita os Termos da Pedra Nova.
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
    case "pix_mp": return "Pix (Mercado Pago)";
    case "mp_parcelado": return `Mercado Pago — ${installments}x`;
    case "apple_pay": return "Apple Pay";
    case "paypal": return "PayPal";
    case "crypto_nowpayments": return "Crypto (NOWPayments)";
    case "pix_direto": return "Pix Direto ⚡";
    case "crypto_direto": return `Crypto Direto 🔗 — ${crypto}`;
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
      <span className="truncate">{file ? file.name : "Anexar imagem ou PDF"}</span>
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

const ReviewBlock = ({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) => (
  <div className="p-4" style={{ border: "1px solid hsl(var(--border))", borderRadius: 8 }}>
    <div className="flex items-center justify-between mb-2">
      <p className="label" style={{ fontSize: 11 }}>{title}</p>
      <button onClick={onEdit} className="font-sans text-xs underline">Editar</button>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

export default CheckoutModal;
