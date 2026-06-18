import { NextResponse } from "next/server";
import { createAdvice, type AdviceRequest } from "@/lib/advisor";

export async function POST(request: Request) {
  const payload = (await request.json()) as AdviceRequest;
  const advice = createAdvice(payload);

  return NextResponse.json(advice);
}
