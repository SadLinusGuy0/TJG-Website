import { NextResponse } from 'next/server';
import { fetchGumroadProducts } from '../../../../lib/gumroad-server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json({ products: await fetchGumroadProducts() }); }
  catch { return NextResponse.json({ error: 'The catalogue is temporarily unavailable.' }, { status: 503 }); }
}
