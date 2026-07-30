import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatWithGroq(
  messages: ChatMessage[]
) {
  const response =
    await groq.chat.completions.create({
      model:
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-20b",

      messages,

      temperature: 0.1,
    });

  return (
    response.choices[0]?.message?.content ?? ""
  );
}
