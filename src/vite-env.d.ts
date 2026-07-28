/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_DOMAIN: string;
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN: string;
  readonly VITE_PIX_KEY: string;
  readonly VITE_WALLET_ETH: string;
  readonly VITE_WALLET_USDT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
