// Static catalog removed — products are now fetched live from Shopify.
// See: src/hooks/useShopifyProducts.ts

export type Product = {
  slug: string;          // shopify product handle
  name: string;
  code: string;          // SKU
  price: number;         // BRL (numeric, from minVariantPrice)
  currencyCode: string;
  category: string;      // productType
  sizes: number[];       // IN STOCK sizes (EU)
  allSizes: number[];    // every size that has a variant (in stock or sold out)
  description: string;
  details: string[];
  badge?: string;
  image?: string;        // first image URL
  images: string[];      // all image URLs
  inStock: boolean;
  variantIdBySize: Record<number, string>; // EU size -> Shopify GID
};

export const formatPrice = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 0 });

export const WHATSAPP_NUMBER = "5500000000000"; // TODO: substituir pelo número do Kaique
