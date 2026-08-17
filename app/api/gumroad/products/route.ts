import { NextResponse } from "next/server";
import { fetchGumroadProducts } from "../../../../lib/gumroad-server";

export const revalidate = 3600;

export async function GET() {
  const products = await fetchGumroadProducts();
  return NextResponse.json({ products });
}
