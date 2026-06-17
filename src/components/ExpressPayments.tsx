// ============================================================
// APPLE_PAY_GOOGLE_PAY_INTEGRATION — Stripe.js Payment Request
// ============================================================
// Renders Apple Pay / Google Pay buttons via Stripe's
// PaymentRequestButtonElement. Stripe auto-detects browser/device
// support — if unsupported, nothing renders (returns null).
//
// To activate:  set VITE_STRIPE_PUBLIC_KEY + VITE_FEATURE_EXPRESS_PAYMENTS=true
// To deactivate: set VITE_FEATURE_EXPRESS_PAYMENTS=false
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { loadStripe, type Stripe, type PaymentRequest } from "@stripe/stripe-js";
import {
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";

const PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const ENABLED = import.meta.env.VITE_FEATURE_EXPRESS_PAYMENTS === "true";

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise && PUBLIC_KEY && PUBLIC_KEY !== "STRIPE_PUBLIC_KEY_PLACEHOLDER") {
    stripePromise = loadStripe(PUBLIC_KEY);
  }
  return stripePromise;
};

type Props = {
  amountBRL: number;
  label?: string;
  onPaid?: (token: unknown) => void;
};

const Inner = ({ amountBRL, label = "Pedido Pedra Nova", onPaid }: Props) => {
  const stripe = useStripe();
  const [pr, setPr] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    if (!stripe) return;
    const request = stripe.paymentRequest({
      country: "BR",
      currency: "brl",
      total: { label, amount: Math.max(50, Math.round(amountBRL * 100)) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    request.canMakePayment().then((res) => {
      if (res) setPr(request);
    });
    request.on("paymentmethod", async (ev) => {
      onPaid?.(ev.paymentMethod);
      ev.complete("success");
    });
  }, [stripe, amountBRL, label, onPaid]);

  if (!pr) return null;
  return (
    <PaymentRequestButtonElement
      options={{ paymentRequest: pr, style: { paymentRequestButton: { height: "44px" } } }}
    />
  );
};

const ExpressPayments = (props: Props) => {
  const promise = useMemo(() => getStripe(), []);
  if (!ENABLED || !promise) return null;
  return (
    <div className="space-y-2">
      <p className="label" style={{ fontSize: 11 }}>Pagamento Expresso</p>
      <Elements stripe={promise}>
        <Inner {...props} />
      </Elements>
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-border" />
        <span className="font-sans text-xs text-muted-foreground">— ou escolha outro método —</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
};

export default ExpressPayments;
