import { NextResponse } from "next/server";
import {
  createCafeCopilotResponse,
  normalizeCafeCopilotRequest
} from "@/lib/advisor";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const adviceRequest = normalizeCafeCopilotRequest(payload);
  const advice = await createCafeCopilotResponse(adviceRequest);

  return NextResponse.json(advice);
}
