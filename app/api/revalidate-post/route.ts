import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret && process.env.NODE_ENV === 'production') {
    console.error('REVALIDATE_SECRET is not set in production');
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (expectedSecret) {
    const token = request.headers.get("x-revalidate-token");
    if (token !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { slug } = await request.json();

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug });
}
