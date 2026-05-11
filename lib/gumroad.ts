export interface GumroadProduct {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  description?: string;
}

export async function getGumroadProducts(): Promise<GumroadProduct[]> {
  try {
    const res = await fetch('/api/gumroad/products');
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: GumroadProduct[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}
