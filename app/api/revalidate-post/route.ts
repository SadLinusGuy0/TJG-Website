import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export async function POST(request: NextRequest) {
  const sanitySecret = process.env.SANITY_WEBHOOK_SECRET;
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);

  const body = await request.text();

  if (signature && sanitySecret) {
    if (!await isValidSignature(body, signature, sanitySecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const slug = payload?.slug?.current;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug in Sanity payload" }, { status: 400 });
    }

    revalidatePath(`/blog/${slug}`);
    revalidatePath('/blog');
    return NextResponse.json({ revalidated: true, slug, source: 'sanity' });
  }

  if (!revalidateSecret && process.env.NODE_ENV === 'production') {
    console.error('REVALIDATE_SECRET is not set in production');
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (revalidateSecret) {
    const token = request.headers.get("x-revalidate-token");
    if (token !== revalidateSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { slug } = JSON.parse(body);

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug });
}
