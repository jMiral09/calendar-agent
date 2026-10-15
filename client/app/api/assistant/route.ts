import { NextRequest, NextResponse } from "next/server";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "Message is required!" }, { status: 400 });
    }

    const apiRes = await fetch(`${process.env.FASTAPI_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body.message }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!apiRes.ok) {
      console.error("FastAPI error:", apiRes.status, await apiRes.text());
      return NextResponse.json({ error: "Assistant service error" }, { status: 502 });
    }

    const data: ChatResponseBody = await apiRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("assistant route error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}