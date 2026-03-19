import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { slug } = await request.json();

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug });
}
