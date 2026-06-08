import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts } from "@/lib/shopify";
import type { Product } from "@/data/products";

const PRODUCTS_KEY = ["shopify", "products"] as const;

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: PRODUCTS_KEY,
    queryFn: () => fetchShopifyProducts(50),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProduct(slug: string | undefined) {
  const q = useProducts();
  const product = slug ? q.data?.find((p) => p.slug === slug) : undefined;
  return { ...q, product };
}
