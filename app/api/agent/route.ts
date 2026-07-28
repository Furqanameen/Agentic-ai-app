import { NextResponse } from "next/server";
import { runSupplierAgent } from "@/lib/ai/agent";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentRequest = {
  messages: ChatMessage[];
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as AgentRequest;

    const { messages } = body;

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Messages are required",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await runSupplierAgent(messages);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Agent API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request.",
      },
      {
        status: 500,
      }
    );
  }
}