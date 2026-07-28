// Persistência mínima do estado do checkout antes de sair para o Shopify.
// Usado por CheckoutModal (pagehide/pageshow) e pela ProductPage (reabrir o modal
// quando o navegador não restaura a página do bfcache e faz reload).

export type CheckoutSnapshot = {
  path: string;
  size?: number;
  step?: string;
  method?: string;
  installments?: number;
  coupon?: { code: string; discount: number } | null;
  couponInput?: string;
  ts: number;
};

const KEY = "pn_checkout_snapshot";
const MAX_AGE_MS = 30 * 60 * 1000;

export const writeCheckoutSnapshot = (snap: Omit<CheckoutSnapshot, "ts">) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...snap, ts: Date.now() }));
  } catch { /* ignore */ }
};

export const readCheckoutSnapshot = (): CheckoutSnapshot | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as CheckoutSnapshot;
    if (!snap || typeof snap !== "object" || typeof snap.ts !== "number") return null;
    if (Date.now() - snap.ts > MAX_AGE_MS) {
      clearCheckoutSnapshot();
      return null;
    }
    return snap;
  } catch {
    return null;
  }
};

export const clearCheckoutSnapshot = () => {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
};
