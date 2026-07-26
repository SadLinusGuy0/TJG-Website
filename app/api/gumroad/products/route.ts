import { NextResponse } from "next/server";
import { GumroadProduct } from "../../../../lib/gumroad";

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

export const revalidate = 3600;

function formatPrice(product: GumroadApiProduct): string | undefined {
  if (product.formatted_price?.trim()) return product.formatted_price.trim();
  if (typeof product.price !== "number" || !Number.isFinite(product.price)) return undefined;

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: product.currency?.toUpperCase() || "USD",
    }).format(product.price / 100);
  } catch {
    return `$${(product.price / 100).toFixed(2)}`;
  }
}

function getRating(product: GumroadApiProduct): GumroadProduct["rating"] {
  const average =
    product.ratings?.average ??
    product.average_rating ??
    product.rating;
  const count =
    product.ratings?.count ??
    product.review_count ??
    product.reviews_count;

  if (typeof average !== "number" || !Number.isFinite(average)) return undefined;

  return {
    average: Math.min(5, Math.max(0, average)),
    count: typeof count === "number" && Number.isFinite(count) ? count : undefined,
  };
}

export async function GET() {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    console.error("GUMROAD_ACCESS_TOKEN is not set");
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/products?access_token=${encodeURIComponent(token)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`Gumroad API returned ${res.status}`);
      return NextResponse.json({ products: [] }, { status: 502 });
    }

    const data = (await res.json()) as GumroadApiResponse;
    if (!data.success || !Array.isArray(data.products)) {
      return NextResponse.json({ products: [] }, { status: 502 });
    }

    const products: GumroadProduct[] = data.products
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id,
        name: p.name,
        url: p.short_url,
        imageUrl: p.preview_url || p.thumbnail_url || "",
        description: p.description,
        formattedPrice: formatPrice(p),
        salesCount:
          typeof p.sales_count === "number" && Number.isFinite(p.sales_count)
            ? p.sales_count
            : undefined,
        rating: getRating(p),
      }))
      .filter((p) => p.imageUrl);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch Gumroad products:", error);
    return NextResponse.json({ products: [] }, { status: 502 });
  }
}
