import { NextResponse } from "next/server";
import { GUMROAD_PRODUCTS, GumroadProduct } from "../../../../lib/gumroad";

interface GumroadApiProduct {
  id: string;
  name: string;
  short_url: string;
  preview_url: string | null;
  thumbnail_url: string | null;
  published: boolean;
  description?: string;
}

interface GumroadApiResponse {
  success: boolean;
  products: GumroadApiProduct[];
}

export const revalidate = 3600;

export async function GET() {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ products: GUMROAD_PRODUCTS, source: "fallback" });
  }

  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/products?access_token=${encodeURIComponent(token)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`Gumroad API returned ${res.status}`);
      return NextResponse.json({ products: GUMROAD_PRODUCTS, source: "fallback" });
    }

    const data = (await res.json()) as GumroadApiResponse;
    if (!data.success || !Array.isArray(data.products)) {
      return NextResponse.json({ products: GUMROAD_PRODUCTS, source: "fallback" });
    }

    const products: GumroadProduct[] = data.products
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id,
        name: p.name,
        url: p.short_url,
        imageUrl: p.preview_url || p.thumbnail_url || "",
        description: p.description,
      }))
      .filter((p) => p.imageUrl);

    return NextResponse.json({ products, source: "gumroad" });
  } catch (error) {
    console.error("Failed to fetch Gumroad products:", error);
    return NextResponse.json({ products: GUMROAD_PRODUCTS, source: "fallback" });
  }
}
