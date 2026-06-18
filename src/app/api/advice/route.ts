import { NextResponse } from "next/server";
import { createCafeAdvice, normalizeCafeBrief } from "@/lib/advisor";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const brief = normalizeCafeBrief(payload);
  const advice = createCafeAdvice(brief);

  return NextResponse.json(advice);
}
