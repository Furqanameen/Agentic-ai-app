
import { chatWithOllama } from "./ollama";
import { chatWithGroq } from "./groq";
import { searchSpareParts } from "@/lib/tools/searchSpareParts";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SearchIntent = {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  partName?: string | null;
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
  messages: ChatMessage[]
) {
  const conversation = messages
    .map(
      (message) =>
        `${message.role}: ${message.content}`
    )
    .join("\n");

  // Step 1: Ask Llama to understand the full conversation
  const extractionPrompt = `
      You are an AI assistant for a car spare parts supplier system.

      Read the complete conversation below.

      Extract the following information needed to search the supplier database:

      - brand
      - model
      - year
      - partName

      IMPORTANT:
      Use information from the entire conversation.

      If the user provided information in an earlier message
      and provides missing information in a later message,
      combine the information together.

      For example:

      User:
      Find brake pads for Toyota Camry.

      Assistant:
      What year is the Toyota Camry?

      User:
      2020

      The extracted result should be:

      {
        "brand": "Toyota",
        "model": "Camry",
        "year": 2020,
        "partName": "Brake Pads"
      }

      Return ONLY valid JSON.

      If a value is genuinely not available in the conversation,
      use null.

      Conversation:

      ${conversation}
      `;

  const aiResponse = await chatWithGroq([
    {
      role: "system",
      content:
        "You extract structured car spare part search parameters from conversation history.",
    },
    {
      role: "user",
      content: extractionPrompt,
    },
  ]);

  const json = extractJson(aiResponse);

  const intent =
    JSON.parse(json) as SearchIntent;

  // Step 2: Check whether we have enough information
  if (
    !intent.brand ||
    !intent.model ||
    !intent.year ||
    !intent.partName
  ) {
    let missingField = "";

    if (!intent.brand) {
      missingField = "car brand";
    } else if (!intent.model) {
      missingField = "car model";
    } else if (!intent.year) {
      missingField = "vehicle year";
    } else if (!intent.partName) {
      missingField = "spare part";
    }

    return {
      intent,
      results: [],
      response: `Could you please provide the ${missingField}?`,
    };
  }

  // Step 3: Search the real database
  const results = await searchSpareParts({
    brand: intent.brand,
    model: intent.model,
    year: intent.year,
    partName: intent.partName,
  });

  // Step 4: Ask Llama to summarize the database results
  const summaryPrompt = `
                        You are a helpful supplier price assistant.

                        The user conversation was:

                        ${conversation}

                        The extracted search parameters were:

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

                        If there are no results, clearly tell the user
                        that no matching supplier price was found.

                        Do not invent any information.

                        Only use the database results provided above.
                        `;

  const finalResponse = await chatWithGroq([
    {
      role: "system",
      content:
        "You summarize supplier database search results accurately without inventing information.",
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

