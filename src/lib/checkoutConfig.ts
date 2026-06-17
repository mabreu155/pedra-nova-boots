// ============================================================
// CONFIG / PLACEHOLDERS — substituir antes de ir ao ar
// ============================================================
// Procurar por "_PLACEHOLDER" no projeto para encontrar tudo
// que precisa ser substituído pelos valores reais do Kaique.
// ============================================================

export const PIX_KEY_PLACEHOLDER = "PIX_KEY_PLACEHOLDER";
export const OWNER_EMAIL_PLACEHOLDER = "pedranovabr@gmail.com";

export const CRYPTO_WALLETS = {
  BTC: "BTC_WALLET_PLACEHOLDER",
  ETH: "0x8116919678bc5931efa5ec458b03b104deaa6652", // ETH / USDT (ERC-20)
  USDT: "0x8116919678bc5931efa5ec458b03b104deaa6652",
  SOL: "SOL_WALLET_PLACEHOLDER",
  LTC: "LTC_WALLET_PLACEHOLDER",
} as const;

export type CryptoSymbol = keyof typeof CRYPTO_WALLETS;

// CoinGecko IDs
export const COINGECKO_IDS: Record<CryptoSymbol, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  SOL: "solana",
  LTC: "litecoin",
};

// ============================================================
// SHOPIFY VARIANT MAPPING
// ============================================================
// Mapeia slug do produto + tamanho EU -> variantId do Shopify
// (gid://shopify/ProductVariant/XXXXXXXXXX).
//
// Preencher conforme os produtos forem criados/sincronizados no
// Shopify Admin. Enquanto não estiver preenchido, o checkout via
// Shopify (cartão, parcelado, Apple Pay, PayPal) vai mostrar um
// erro amigável pedindo para o cliente usar Pix / Crypto.
// ============================================================
export const SHOPIFY_VARIANT_MAP: Record<string, Record<number, string>> = {
  // exemplo:
  // "wall006": { 36: "gid://shopify/ProductVariant/123", 37: "gid://shopify/ProductVariant/124" },
};

export const getShopifyVariantId = (slug: string, size: number): string | null =>
  SHOPIFY_VARIANT_MAP[slug]?.[size] ?? null;
