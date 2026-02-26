import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to avoid loading flags package when FLAGS env var isn't set
export async function GET(request: NextRequest) {
  if (!process.env.FLAGS) {
    return NextResponse.json({ flags: [] }, { status: 200 });
  }
  const { createFlagsDiscoveryEndpoint } = await import('flags/next');
  const { getProviderData } = await import('@flags-sdk/vercel');
  const flags = await import('../../../../flags');
  const handler = createFlagsDiscoveryEndpoint(async () => getProviderData(flags));
  return handler(request);
}
