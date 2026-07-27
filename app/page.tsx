"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResponse(data.response);
    } catch (error) {
      console.error(error);

      setResponse(
        "Sorry, something went wrong while communicating with the AI."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">
          Supplier AI Agent
        </h1>

        <p className="mb-8 text-gray-600">
          Your local AI assistant powered by Llama 3.2 3B.
        </p>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask something..."
          rows={5}
          className="w-full rounded-lg border p-4"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="mt-4 rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        {response && (
          <div className="mt-8 rounded-lg border p-6">
            <h2 className="mb-3 font-semibold">
              AI Response
            </h2>

            <p className="whitespace-pre-wrap">
              {response}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}