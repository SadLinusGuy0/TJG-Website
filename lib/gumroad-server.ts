import 'server-only';

import { readBoundedJson, UpstreamError } from './upstream';
import { safeContentHref } from './contentUrls';
import type { GumroadProduct } from './gumroad';

interface GumroadApiProduct {
  id: string;
  name: string;
  short_url: string;
  preview_url: string | null;
  thumbnail_url: string | null;
  published: boolean;
  description?: string;
  price?: number;
  currency?: string;
  formatted_price?: string;
  sales_count?: number;
  average_rating?: number;
  rating?: number;
  review_count?: number;
  reviews_count?: number;
  ratings?: {
    average?: number;
    count?: number;
  };
}

interface GumroadApiResponse {
  success: boolean;
  products: GumroadApiProduct[];
}

function formatPrice(product: GumroadApiProduct): string | undefined {
  if (product.formatted_price?.trim()) return product.formatted_price.trim();
  if (typeof product.price !== 'number' || !Number.isFinite(product.price)) return undefined;

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: product.currency?.toUpperCase() || 'USD',
    }).format(product.price / 100);
  } catch {
    return `$${(product.price / 100).toFixed(2)}`;
  }
}

function getRating(product: GumroadApiProduct): GumroadProduct['rating'] {
  const average =
    product.ratings?.average ??
    product.average_rating ??
    product.rating;
  const count =
    product.ratings?.count ??
    product.review_count ??
    product.reviews_count;

  if (typeof average !== 'number' || !Number.isFinite(average)) return undefined;

  return {
    average: Math.min(5, Math.max(0, average)),
    count: typeof count === 'number' && Number.isFinite(count) ? count : undefined,
  };
}

export async function fetchGumroadProducts(): Promise<GumroadProduct[]> {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    throw new UpstreamError('Shop');
  }

  try {
    const response = await fetch(
      'https://api.gumroad.com/v2/products',
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000), redirect: 'error' },
    );

    const data = await readBoundedJson<GumroadApiResponse>(response, 'Shop');
    if (!data.success || !Array.isArray(data.products)) throw new UpstreamError('Shop');

    return data.products
      .filter((product) => product.published)
      .map((product) => ({
        id: product.id,
        name: product.name,
        url: safeContentHref(product.short_url),
        imageUrl: safeContentHref(product.preview_url || product.thumbnail_url || '', true),
        description: product.description,
        formattedPrice: formatPrice(product),
        salesCount:
          typeof product.sales_count === 'number' && Number.isFinite(product.sales_count)
            ? product.sales_count
            : undefined,
        rating: getRating(product),
      }))
      .filter((product) => product.imageUrl && product.url);
  } catch { throw new UpstreamError('Shop'); }
}
