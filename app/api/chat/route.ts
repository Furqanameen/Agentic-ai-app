import { NextResponse } from "next/server";
import { askOllama } from "@/lib/ai/ollama";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body.message;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await askOllama(message);

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      {
        error: "Failed to communicate with AI",
      },
      { status: 500 }
    );
  }
}