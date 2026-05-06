import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ChevronLeft, CreditCard, Lock } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: number | null;
};

type Step = "delivery" | "payment" | "review" | "done";

const SHIPPING = 39;
const BUYER_PROTECTION_PCT = 0.045;

const CheckoutModal = ({ open, onClose, product, size }: Props) => {
  const [step, setStep] = useState<Step>("delivery");
  const [address, setAddress] = useState({
    name: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [card, setCard] = useState({
    number: "",
    name: "",
    exp: "",
    cvv: "",
  });
  const [method, setMethod] = useState<"card" | "pix">("card");

  const subtotal = product.price;
  const protection = Math.round(subtotal * BUYER_PROTECTION_PCT);
  const total = subtotal + SHIPPING + protection;

  const close = () => {
    onClose();
    setTimeout(() => setStep("delivery"), 300);
  };

  const next = () => {
    if (step === "delivery") setStep("payment");
    else if (step === "payment") setStep("review");
    else if (step === "review") setStep("done");
  };

  const back = () => {
    if (step === "payment") setStep("delivery");
    else if (step === "review") setStep("payment");
  };

  const deliveryValid =
    address.name && address.street && address.number && address.city && address.state && address.zip && address.phone;
  const paymentValid = method === "pix" || (card.number && card.name && card.exp && card.cvv);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(13,13,13,0.5)", backdropFilter: "blur(6px)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-6"
          >
            <div
              className="bg-background w-full md:max-w-[920px] pointer-events-auto flex flex-col md:flex-row overflow-hidden"
              style={{
                maxHeight: "92vh",
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
              }}
            >
              {/* HEADER (mobile only) */}
              <div
                className="flex items-center justify-between px-4 md:hidden"
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

              {/* LEFT — form */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8">
                {/* Stepper (desktop) */}
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
                      <MethodTile active={method === "pix"} onClick={() => setMethod("pix")} icon={<span className="font-bold text-xs">PIX</span>} label="Pix" />
                    </div>

                    {method === "card" && (
                      <div className="space-y-4 pt-2">
                        <Field label="Número do cartão" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="0000 0000 0000 0000" />
                        <Field label="Nome no cartão" value={card.name} onChange={(v) => setCard({ ...card, name: v })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Validade" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} placeholder="MM/AA" />
                          <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="123" />
                        </div>
                      </div>
                    )}

                    {method === "pix" && (
                      <div
                        className="p-4 font-sans text-sm"
                        style={{ background: "hsl(var(--secondary))", borderRadius: 8 }}
                      >
                        Você receberá o QR Code Pix na próxima etapa. O pedido é confirmado automaticamente após o pagamento.
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
                      {method === "card" ? (
                        <p className="font-sans text-sm">
                          Cartão final {card.number.replace(/\s/g, "").slice(-4) || "••••"}
                        </p>
                      ) : (
                        <p className="font-sans text-sm">Pix</p>
                      )}
                    </ReviewBlock>

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
                    <p className="font-sans text-sm text-muted-foreground mb-6">
                      Enviamos a confirmação para o seu e-mail. Você pode acompanhar pelo painel.
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
                  style={{
                    background: "hsl(var(--secondary))",
                    borderTop: "1px solid hsl(var(--border))",
                  }}
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
                    onClick={next}
                    disabled={
                      (step === "delivery" && !deliveryValid) ||
                      (step === "payment" && !paymentValid)
                    }
                    className="w-full bg-foreground text-background font-sans font-semibold text-sm py-3.5 mt-5 disabled:opacity-40 hover:opacity-90 transition-opacity"
                    style={{ borderRadius: 8 }}
                  >
                    {step === "delivery" && "Continuar para pagamento"}
                    {step === "payment" && "Revisar pedido"}
                    {step === "review" && `Pagar ${formatPrice(total)}`}
                  </button>

                  <p className="font-sans text-xs text-muted-foreground text-center mt-3">
                    Ao finalizar, você aceita os Termos da Pedra Nova.
                  </p>
                </aside>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="label block mb-1.5" style={{ fontSize: 11 }}>{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full font-sans text-sm bg-background"
      style={{
        padding: "10px 12px",
        border: "1px solid hsl(var(--border))",
        borderRadius: 6,
        outline: "none",
      }}
    />
  </label>
);

const MethodTile = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
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

const ReviewBlock = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
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
