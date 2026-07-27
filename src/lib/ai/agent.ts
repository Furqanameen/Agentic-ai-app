import { chatWithOllama } from "./ollama";
import { searchSpareParts } from "@/lib/tools/searchSpareParts";

type SearchIntent = {
  brand?: string;
  model?: string;
  year?: number;
  partName?: string;
};

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI did not return valid JSON");
  }

  return text.slice(start, end + 1);
}

export async function runSupplierAgent(
  userMessage: string
) {
    // Step 1: Ask Llama to understand the request
    const extractionPrompt = `
    You are an AI assistant for a car spare parts supplier system.

    Extract the following information from the user's request:

    - brand
    - model
    - year
    - partName

    Return ONLY valid JSON.

    Example:

    {
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "partName": "Brake Pads"
    }

    If a value is not provided, use null.

    User request:
    ${userMessage}
  `;

  const aiResponse = await chatWithOllama([
    {
      role: "system",
      content:
        "You extract structured car spare part search parameters.",
    },
    {
      role: "user",
      content: extractionPrompt,
    },
  ]);

  const json = extractJson(aiResponse);

  const intent =
    JSON.parse(json) as SearchIntent;

  // Step 2: Call our real database search tool
  const results = await searchSpareParts({
    brand: intent.brand,
    model: intent.model,
    year: intent.year,
    partName: intent.partName,
  });

  // Step 3: Ask Llama to summarize the results
      const summaryPrompt = `
    You are a helpful supplier price assistant.

    The user asked:

    "${userMessage}"

    The database search parameters were:

    ${JSON.stringify(intent, null, 2)}

    The database returned these supplier results:

    ${JSON.stringify(results, null, 2)}

    Give the user a concise and useful answer.

    Mention:
    - The matching vehicle
    - The spare part
    - Available suppliers
    - Supplier prices
    - The cheapest option

    If there are no results, clearly tell the user that no matching supplier price was found.

    Do not invent any information.
    Only use the database results provided above.
  `;

  const finalResponse = await chatWithOllama([
    {
      role: "system",
      content:
        "You summarize supplier database search results accurately.",
    },
    {
      role: "user",
      content: summaryPrompt,
    },
  ]);

  return {
    intent,
    results,
    response: finalResponse,
  };
}