// ============================================================
// CONFIG / PLACEHOLDERS — substituir antes de ir ao ar
// ============================================================
// Procurar por "_PLACEHOLDER" no projeto para encontrar tudo
// que precisa ser substituído pelos valores reais do Kaique.
// ============================================================

export const PIX_KEY_PLACEHOLDER = "9d380c29-8f68-4694-8b9d-caea4ecbd05a";
export const OWNER_EMAIL_PLACEHOLDER = "pedranovabrasil@gmail.com";

export const CRYPTO_WALLETS = {
  BTC: "0x8116919678bc5931efa5ec458b03b104deaa6652",
  ETH: "0x8116919678bc5931efa5ec458b03b104deaa6652",
  USDT: "0x8116919678bc5931efa5ec458b03b104deaa6652",
  SOL: "0x8116919678bc5931efa5ec458b03b104deaa6652",
  LTC: "0x8116919678bc5931efa5ec458b03b104deaa6652",
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
