// ============================================================
// Camada de segurança — validação e sanitização de inputs
// ============================================================
// Utilitários puros usados nos fluxos Pix/Crypto e no redirect
// para a Shopify. Não alteram lógica funcional: apenas limpam,
// limitam e validam dados antes de serem enviados ou exibidos.
// ============================================================

/** Remove caracteres de controlo e limita o comprimento de texto livre. */
export function sanitizeText(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Códigos de cupão: apenas alfanuméricos, hífen e underscore, em maiúsculas. */
export function sanitizeDiscountCode(value: unknown, maxLength = 64): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, maxLength);
}

/** Hash/TXID de transação: alfanumérico (+ alguns separadores usados por chains). */
export function sanitizeTxid(value: unknown, maxLength = 128): string {
  return String(value ?? "")
    .trim()
    .replace(/[^A-Za-z0-9:_-]/g, "")
    .slice(0, maxLength);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validação de email (formato + comprimento máximo RFC). */
export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 254 && EMAIL_RE.test(v);
}

// ---------------- Upload de comprovativo ----------------

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RECEIPT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

export type FileCheck = { ok: true } | { ok: false; reason: "type" | "size" };

/** Valida tipo MIME e tamanho do comprovativo antes de o converter em base64. */
export function checkReceiptFile(file: File): FileCheck {
  if (!ALLOWED_RECEIPT_MIME.includes(file.type)) return { ok: false, reason: "type" };
  if (file.size > MAX_RECEIPT_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
}

/** Nome de ficheiro seguro (sem paths nem caracteres especiais). */
export function sanitizeFilename(name: string, maxLength = 100): string {
  return name.replace(/[^\w.\-]/g, "_").slice(0, maxLength) || "comprovativo";
}

// ---------------- Redirects ----------------

/**
 * Hosts para os quais é permitido redirecionar o cliente. Protege contra
 * open redirect caso a resposta da API seja manipulada/envenenada.
 */
const ALLOWED_REDIRECT_HOST_SUFFIXES = [".myshopify.com", ".shopify.com"];

export function isTrustedCheckoutUrl(url: string, extraHosts: string[] = []): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (extraHosts.some((h) => host === h.toLowerCase())) return true;
    return ALLOWED_REDIRECT_HOST_SUFFIXES.some((s) => host.endsWith(s));
  } catch {
    return false;
  }
}
