// Shopify Storefront API client
import type { Product } from "@/data/products";

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "0ksify-g2.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "5f90087a91c91191d6e26ee6fcbeb26c";

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | null> {
  const res = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 402) {
    console.error("Shopify billing required");
    return null;
  }
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors.map((e: any) => e.message).join(", "));
  return data;
}

// ---------------- Cart / checkout ----------------

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        discountCodes { code applicable }
      }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("channel", "online_store");
    return u.toString();
  } catch {
    return url;
  }
}

export async function createShopifyCheckout(
  variantId: string,
  quantity: number = 1,
  discountCode?: string,
): Promise<string | null> {
  return createShopifyCheckoutMulti([{ variantId, quantity }], discountCode);
}

export async function createShopifyCheckoutMulti(
  lines: Array<{ variantId: string; quantity: number }>,
  discountCode?: string,
): Promise<string | null> {
  const input: Record<string, unknown> = {
    lines: lines.map((l) => ({ quantity: l.quantity, merchandiseId: l.variantId })),
  };
  if (discountCode) input.discountCodes = [discountCode];
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, { input });
  const result = data?.data?.cartCreate;
  if (!result) return null;
  if (result.userErrors?.length) {
    console.error("Shopify cart errors", result.userErrors);
    return null;
  }
  const checkoutUrl = result.cart?.checkoutUrl;
  return checkoutUrl ? formatCheckoutUrl(checkoutUrl) : null;
}

// ---------------- Discount validation ----------------

export type DiscountValidation =
  | {
      ok: true;
      code: string;
      subtotal: number;
      total: number;
      discount: number;
      currencyCode: string;
    }
  | { ok: false; reason: "not_applicable" | "error"; message?: string };

/**
 * Validates a discount code against a throwaway Shopify cart with the given lines.
 * Returns Shopify-calculated subtotal/total so we know the exact discount amount
 * (handles both percentage and fixed-amount codes correctly).
 */
export async function validateShopifyDiscount(
  lines: Array<{ variantId: string; quantity: number }>,
  code: string,
): Promise<DiscountValidation> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, reason: "error", message: "Código vazio" };
  if (lines.length === 0) return { ok: false, reason: "error", message: "Carrinho vazio" };
  try {
    const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines: lines.map((l) => ({ quantity: l.quantity, merchandiseId: l.variantId })),
        discountCodes: [trimmed],
      },
    });
    const result = data?.data?.cartCreate;
    if (!result || result.userErrors?.length) {
      return { ok: false, reason: "error", message: result?.userErrors?.[0]?.message };
    }
    const cart = result.cart;
    const applied = cart?.discountCodes?.find((d: any) => d.applicable);
    if (!applied) return { ok: false, reason: "not_applicable" };
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const total = parseFloat(cart.cost.totalAmount.amount);
    const discount = Math.max(0, subtotal - total);
    return {
      ok: true,
      code: applied.code,
      subtotal,
      total,
      discount,
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  } catch (e: any) {
    return { ok: false, reason: "error", message: e?.message };
  }
}

// ---------------- Products ----------------

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 20) {
            edges { node { url altText } }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

type ShopifyVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string | null;
  tags: string[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
};

// Try to extract the EU size as a number from a variant's selectedOptions.
// Looks for an option named tamanho/size/eu, then falls back to scanning the
// variant title for the first integer between 30 and 50.
function parseSize(variant: ShopifyVariant): number | null {
  const sizeOption = variant.selectedOptions.find((o) =>
    /tamanho|size|eu|número|numero/i.test(o.name)
  );
  const raw = sizeOption?.value ?? variant.title ?? "";
  const match = String(raw).match(/\d{2}/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  if (n >= 30 && n <= 50) return n;
  return null;
}

// Heuristic split of the Shopify description into a short paragraph + bullets.
// Bullets are inferred from lines starting with "- ", "• " or "* ".
function splitDescription(desc: string): { description: string; details: string[] } {
  if (!desc) return { description: "", details: [] };
  const lines = desc.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const details: string[] = [];
  const paragraphs: string[] = [];
  for (const l of lines) {
    if (/^[-•*]\s+/.test(l)) details.push(l.replace(/^[-•*]\s+/, ""));
    else paragraphs.push(l);
  }
  return { description: paragraphs.join(" ").trim(), details };
}

function mapShopifyProduct(node: ShopifyProductNode): Product {
  const variants = node.variants.edges.map((e) => e.node);

  const variantIdBySize: Record<number, string> = {};
  const allSizesSet = new Set<number>();
  const sizesSet = new Set<number>();

  for (const v of variants) {
    const size = parseSize(v);
    if (size == null) continue;
    allSizesSet.add(size);
    // First variant wins for a given size
    if (variantIdBySize[size] == null) variantIdBySize[size] = v.id;
    if (v.availableForSale) sizesSet.add(size);
  }

  const inStock = variants.some((v) => v.availableForSale);
  const images = node.images.edges.map((e) => e.node.url);
  const { description, details } = splitDescription(node.description ?? "");
  const firstSku =
    variants.find((v) => v.sku)?.sku ?? node.handle.toUpperCase();

  // Condition badge controlled via Shopify tags: Nova, Como Nova, Bom, Regular
  const CONDITION_BADGES: Array<{ label: string; match: RegExp }> = [
    { label: "Nova", match: /^(nova|new)$/i },
    { label: "Como Nova", match: /^como[\s-]?nova$/i },
    { label: "Bom", match: /^(bom|good)$/i },
    { label: "Regular", match: /^(regular|fair)$/i },
  ];
  const badgeLabel = CONDITION_BADGES.find((b) =>
    node.tags?.some((t) => b.match.test(t.trim()))
  )?.label;

  return {
    slug: node.handle,
    name: node.title,
    code: firstSku,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    category: node.productType || "Boots",
    sizes: Array.from(sizesSet).sort((a, b) => a - b),
    allSizes: Array.from(allSizesSet).sort((a, b) => a - b),
    description,
    details,
    badge: badgeLabel,
    image: images[0],
    images,
    inStock,
    variantIdBySize,
  };
}

export async function fetchShopifyProducts(first = 50): Promise<Product[]> {
  const data = await storefrontApiRequest<{
    data: { products: { edges: Array<{ node: ShopifyProductNode }> } };
  }>(PRODUCTS_QUERY, { first });
  const edges = data?.data?.products?.edges ?? [];
  return edges.map((e) => mapShopifyProduct(e.node));
}

// ---------------- Collection Products ----------------

const COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            tags
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            images(first: 20) {
              edges { node { url altText } }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  selectedOptions { name value }
                }
              }
            }
            options { name values }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyCollectionProducts(
  handle: string,
  first = 50
): Promise<Product[]> {
  const data = await storefrontApiRequest<{
    data: { collection: { products: { edges: Array<{ node: ShopifyProductNode }> } } | null };
  }>(COLLECTION_PRODUCTS_QUERY, { handle, first });
  const edges = data?.data?.collection?.products?.edges ?? [];
  return edges.map((e) => mapShopifyProduct(e.node));
}
