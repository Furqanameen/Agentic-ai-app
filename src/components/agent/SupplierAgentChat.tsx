"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function SupplierAgentChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: trimmedMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Agent request failed");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[600px] max-w-4xl flex-col rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">
          Supplier AI Assistant
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Ask me to find spare parts and supplier prices.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-lg font-semibold">
              How can I help?
            </h2>

            <p className="mt-2 text-gray-500">
              Try:
            </p>

            <p className="mt-2 text-sm text-gray-600">
              "Find brake pads for a 2020 Toyota Camry"
            </p>
          </div>
        )}

        {messages.map((item, index) => (
          <div
            key={index}
            className={
              item.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={
                item.role === "user"
                  ? "max-w-[80%] rounded-xl bg-black px-4 py-3 text-white"
                  : "max-w-[80%] rounded-xl bg-gray-100 px-4 py-3 text-gray-900"
              }
            >
              {item.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-gray-500">
              Searching supplier database...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t p-4"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Ask about a spare part..."
            disabled={loading}
            className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />

          <button
            type="submit"
            disabled={
              loading || !message.trim()
            }
            className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}