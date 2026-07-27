const OLLAMA_URL = "http://localhost:11434/api/chat";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaResponse = {
  message: {
    role: string;
    content: string;
  };
};

export async function chatWithOllama(
  messages: OllamaMessage[]
) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as OllamaResponse;

  return data.message.content;
}