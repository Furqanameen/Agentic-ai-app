
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

function getLatestUserMessage(messages: ChatMessage[]) {
  const userMessages = messages.filter(
    (message) => message.role === "user"
  );

  return userMessages[userMessages.length - 1]?.content || "";
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

  const latestUserMessage =
    getLatestUserMessage(messages);

  /*
   * STEP 1
   *
   * Extract the search intent.
   *
   * IMPORTANT:
   * The latest user message has priority.
   *
   * Previous messages may be used to fill information
   * that is genuinely missing from the latest request.
   *
   * Example:
   *
   * Previous:
   * Toyota Camry 2020
   *
   * Latest:
   * Find mirror
   *
   * Result:
   * Toyota / Camry / 2020 / Mirror
   *
   * NOT:
   * Toyota / Camry / 2020 / Brake Pads
   */

  const extractionPrompt = `
    You are an AI assistant for a car spare parts supplier system.

    Your job is to determine the CURRENT search intent from the conversation.

    There are four fields:

    - brand
    - model
    - year
    - partName

    IMPORTANT RULES:

    1. The LATEST USER MESSAGE has the highest priority.

    2. If the latest user message explicitly changes a field,
       use the new value.

    3. NEVER keep an old partName if the latest user message
       asks for a different part.

    4. If the latest user message says something like:
       "find mirror"
       "find pads"
       "I need a clutch"
       "what about headlights"

       then that new part becomes the current partName.

    5. Previous conversation may be used to fill fields that
       are not changed by the latest user message.

    6. Assistant messages are NOT user-provided facts.
       Do not treat an assistant question as a new search value.

    7. Short follow-up answers should use the existing context.

    Example:

    User:
    Find Toyota brake pads

    Assistant:
    Could you please provide the car model?

    User:
    Camry

    Assistant:
    Could you please provide the vehicle year?

    User:
    2020

    Current intent:

    {
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "partName": "Brake Pads"
    }

    Another example:

    Previous conversation:

    User:
    Find Toyota Camry 2020 brake pads

    Latest user message:

    User:
    Find mirror

    Current intent MUST be:

    {
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "partName": "Mirror"
    }

    NOT:

    {
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "partName": "Brake Pads"
    }

    Another example:

    Previous conversation:

    Toyota Camry 2020 brake pads

    Latest user message:

    Find Honda Civic clutch

    Current intent MUST be:

    {
      "brand": "Honda",
      "model": "Civic",
      "year": null,
      "partName": "Clutch"
    }

    Do not blindly copy previous values.

    Return ONLY valid JSON.

    Use null when a value is genuinely unavailable.

    Previous conversation:

    ${conversation}

    LATEST USER MESSAGE:

    ${latestUserMessage}
    `;

  const aiResponse = await chatWithGroq([
    {
      role: "system",
      content:
        "You extract the current structured spare-part search intent accurately.",
    },
    {
      role: "user",
      content: extractionPrompt,
    },
  ]);

  const json = extractJson(aiResponse);

  const intent =
    JSON.parse(json) as SearchIntent;

  /*
   * STEP 2
   *
   * Check whether enough information exists
   * to perform a database search.
   */

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

  /*
   * STEP 3
   *
   * Search the real PostgreSQL database.
   */

  const results = await searchSpareParts({
    brand: intent.brand,
    model: intent.model,
    year: intent.year,
    partName: intent.partName,
  });

  /*
   * STEP 4
   *
   * IMPORTANT:
   * If the database returns nothing, do NOT ask the LLM
   * to invent or reinterpret previous results.
   */

  if (results.length === 0) {
    return {
      intent,
      results: [],
      response:
        `I couldn't find any matching supplier price for ` +
        `${intent.brand} ${intent.model} ${intent.year} ${intent.partName}.`,
    };
  }

  /*
   * STEP 5
   *
   * Determine the cheapest available supplier
   * from the actual database results.
   */

  const availableResults = results.filter(
    (result) => result.available
  );

  const cheapest =
    availableResults.length > 0
      ? availableResults.reduce((lowest, current) =>
          Number(current.price) <
          Number(lowest.price)
            ? current
            : lowest
        )
      : null;

  /*
   * STEP 6
   *
   * Ask Groq only to communicate the database results.
   *
   * It must NOT calculate or invent prices.
   */

  const summaryPrompt = `
        You are a helpful supplier price assistant.

        The user is searching for:

        ${JSON.stringify(intent, null, 2)}

        The database returned these results:

        ${JSON.stringify(results, null, 2)}

        The cheapest available supplier calculated directly
        from the database is:

        ${JSON.stringify(cheapest, null, 2)}

        Give the user a concise answer.

        Mention:

        - Matching vehicle
        - Spare part
        - Available suppliers
        - Supplier prices
        - Cheapest available option

        IMPORTANT:

        - Only use information from the database results.
        - Do not invent suppliers.
        - Do not invent prices.
        - Do not reuse results from previous searches.
        - Do not mention previous searches unless necessary.
        - Do not say a previous part was found.
        - If the cheapest supplier is provided above, use it.
      `;

  const finalResponse = await chatWithGroq([
    {
      role: "system",
      content:
        "You summarize the current database search results accurately.",
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
