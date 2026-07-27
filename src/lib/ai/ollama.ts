const OLLAMA_URL = "http://localhost:11434";

const MODEL_NAME = "llama3.2:3b";

type OllamaResponse = {
  response: string;
};

export async function askOllama(
  prompt: string
): Promise<string> {
  const response = await fetch(
    `${OLLAMA_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt,
        stream: false,
        format: "json",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status}`
    );
  }

  const data: OllamaResponse =
    await response.json();

  return data.response;
}