import { askOllama } from "./ollama";
import { searchSpareParts } from "../tools/spare-parts";

type AgentDecision = {
  action: "searchSpareParts" | "final_answer";
  arguments?: {
    brand?: string;
    model?: string;
    year?: number;
    partName?: string;
  };
  answer?: string;
};

export async function runAgent(
  userMessage: string
) {
  const prompt = `
You are an AI agent for a car supplier price inquiry system.

You have access to the following tool:

TOOL:
searchSpareParts

DESCRIPTION:
Search supplier spare-part prices using:
- car brand
- car model
- car year
- spare part name

You must decide what action to take.

If the user is asking for a spare part price and enough information is available,
return this JSON:

{
  "action": "searchSpareParts",
  "arguments": {
    "brand": "Toyota",
    "model": "Camry",
    "year": 2018,
    "partName": "Front Brake Pads"
  }
}

If you cannot identify enough information,
return:

{
  "action": "final_answer",
  "answer": "Please provide the car brand, model, year and spare part."
}

USER REQUEST:
${userMessage}
`;

  const aiResponse =
    await askOllama(prompt);

  let decision: AgentDecision;

  try {
    decision =
      JSON.parse(aiResponse);
  } catch {
    return {
      type: "error",
      message:
        "The AI returned invalid JSON.",
      rawResponse: aiResponse,
    };
  }

  if (
    decision.action ===
    "final_answer"
  ) {
    return {
      type: "final_answer",
      answer:
        decision.answer ||
        "I need more information.",
    };
  }

  if (
  decision.action ===
  "searchSpareParts"
  ) {
    const results =
      searchSpareParts({
        brand:
          decision.arguments?.brand,
        model:
          decision.arguments?.model,
        year:
          decision.arguments?.year,
        partName:
          decision.arguments?.partName,
      });

    const finalAnswer =
      await generateFinalAnswer(
        userMessage,
        results
      );

    return {
      type: "final_answer",
      answer: finalAnswer,
      query: decision.arguments,
      results,
    };
  }

  return {
    type: "error",
    message:
      "Unknown agent action.",
  };
}

async function generateFinalAnswer(
  userMessage: string,
  toolResults: unknown
  ) {
    const prompt = `
    You are a helpful supplier price inquiry assistant.

    The user asked:

    ${userMessage}

    You searched the supplier database.

    Here are the results:

    ${JSON.stringify(
      toolResults,
      null,
      2
    )}

  Now provide a clear answer to the user.

  Rules:

  1. Mention the matching spare parts.
  2. Mention suppliers and prices.
  3. Identify the cheapest option.
  4. Do not invent information.
  5. If there are no results, clearly say that no matching spare parts were found.
  `;

  return await askOllama(prompt);
}