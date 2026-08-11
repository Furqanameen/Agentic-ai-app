
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

    if (
      !body.messages ||
      !Array.isArray(body.messages)
    ) {
      return NextResponse.json(
        {
          error: "messages array is required",
        },
        {
          status: 400,
        }
      );
    }

    const messages = body.messages.filter(
      (message) =>
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    );

    if (messages.length === 0) {
      return NextResponse.json(
        {
          error: "At least one message is required",
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

