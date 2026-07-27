import { NextResponse } from "next/server";
import { runSupplierAgent } from "@/lib/ai/agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body.message;

    if (
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await runSupplierAgent(message);

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