import { NextResponse } from "next/server";
import { weaviateMeta } from "@/lib/weaviate";

export async function GET() {
  try {
    const data = await weaviateMeta();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
