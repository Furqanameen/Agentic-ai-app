"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function SupplierAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong."
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.response ||
          "I couldn't generate a response.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[600px] max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gray-900 px-6 py-4 text-white">
        <h1 className="text-xl font-semibold">
          Supplier AI Agent
        </h1>

        <p className="mt-1 text-sm text-gray-300">
          Find vehicle spare parts and supplier prices.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-6">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <h2 className="font-medium text-gray-800">
              How can I help?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try:
            </p>

            <p className="mt-1 text-sm text-gray-700">
              "Find brake pads for Toyota Camry 2020"
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 bg-white text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              Searching suppliers...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-gray-200 bg-white p-4"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={loading}
            placeholder="Ask about a spare part..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={
              loading || !input.trim()
            }
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
