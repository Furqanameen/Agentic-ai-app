import { chatWithGroq } from "./groq";

async function main() {
  const response = await chatWithGroq([
    {
      role: "user",
      content:
        "Say hello and tell me that you are running on Groq.",
    },
  ]);

  console.log(response);
}

main().catch(console.error);
