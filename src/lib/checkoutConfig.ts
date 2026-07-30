// ============================================================
// CONFIG — valores vêm de variáveis de ambiente
// ============================================================

export const PIX_KEY_PLACEHOLDER = import.meta.env.VITE_PIX_KEY as string;
export const OWNER_EMAIL_PLACEHOLDER = "pedranovabrasil@gmail.com";

// Apenas redes EVM: o endereço configurado é um endereço EVM (0x…),
// válido para ETH e USDT (ERC-20). Não adicionar BTC/SOL/LTC sem
// endereços reais dessas redes — fundos enviados seriam perdidos.
export const CRYPTO_WALLETS: Record<"ETH" | "USDT", string> = {
  ETH: import.meta.env.VITE_WALLET_ETH as string,
  USDT: (import.meta.env.VITE_WALLET_USDT ?? import.meta.env.VITE_WALLET_ETH) as string,
};

export type CryptoSymbol = keyof typeof CRYPTO_WALLETS;

// CoinGecko IDs
export const COINGECKO_IDS: Record<CryptoSymbol, string> = {
  ETH: "ethereum",
  USDT: "tether",
};
