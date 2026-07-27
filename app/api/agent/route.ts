import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/src/lib/ai/agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await runAgent(message);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent error:", error);

    return NextResponse.json(
      {
        error: "Agent failed to process request",
      },
      {
        status: 500,
      }
    );
  }
}