
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Leaf,
  MessageCircle,
  Loader2,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type Status = "ready" | "thinking";

export default function Home() {
  const [status, setStatus] = useState<Status>("ready");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hello, friend! 🌼 It's a lovely day in Littlewood!",
    },
  ]);

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, status]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || status === "thinking") return;

    setInput("");
    setError("");
    setStatus("thinking");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
    };

    const updatedMessages = [...messages, userMessage];

    // Immediately display the user's message.
    setMessages(updatedMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, text }) => ({
            role,
            text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong. Please try again."
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.reply,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      console.error("Littlewood chat error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "I couldn't connect. Please try again."
      );

      // Restore the user's message in the input for retrying.
      setInput(text);
    } finally {
      setStatus("ready");
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#b9d9dc]">
      {/* Village background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/bg.png')",
        }}
      />

      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#203b35]/15 via-transparent to-[#203b35]/30" />

      <div className="relative z-10 flex min-h-dvh flex-col px-4 py-5 sm:px-8 sm:py-7">

        {/* Header */}
        <header className="flex items-center justify-between">
          <img src="/logo.png" alt="Littlewood Logo" className="h-24 w-auto" />

          <div className="rounded-full border border-white/50 bg-white/75 px-4 py-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm font-medium text-[#536c53]">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "thinking"
                    ? "animate-pulse bg-amber-500"
                    : "bg-green-500"
                }`}
              />
              {status === "thinking"
                ? "Littlewood is thinking"
                : "Littlewood is ready"}
            </div>
          </div>
        </header>

        {/* Conversation */}
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-white/70 text-[#9b8ac5] shadow-lg backdrop-blur-md">
              <Sparkles size={27} />
            </div>

            <h2 className="text-3xl font-bold text-white drop-shadow-md sm:text-4xl">
              Welcome to Littlewood!
            </h2>

            <p className="mt-2 text-white drop-shadow-md">
              What would you like to talk about?
            </p>
          </div>

          <div className="flex max-h-[45dvh] flex-col gap-5 overflow-y-auto px-2 py-2">
            {messages.slice(-8).map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-5 py-4 shadow-lg backdrop-blur-md ${
                    message.role === "user"
                      ? "rounded-br-md border border-[#d8e5c9]/70 bg-[#e8f0d9]/90 text-[#526648]"
                      : "rounded-bl-md border border-white/70 bg-[#fffaf0]/90 text-[#655b49]"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
                    {message.role === "user" ? (
                      <MessageCircle size={13} />
                    ) : (
                      <Sparkles size={13} />
                    )}

                    {message.role === "user" ? "You" : "Littlewood"}
                  </div>

                  <p className="text-sm leading-relaxed sm:text-base">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {status === "thinking" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-[24px] rounded-bl-md border border-white/70 bg-[#fffaf0]/90 px-5 py-4 text-[#655b49] shadow-lg">
                  <Loader2 size={17} className="animate-spin" />
                  <span className="text-sm">Let me think...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* Temporary text input */}
        <footer className="mx-auto w-full max-w-2xl pb-4">

          {error && (
            <p className="mb-3 text-center text-sm font-medium text-white drop-shadow-md">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 rounded-full border border-white/70 bg-[#fffaf0]/95 p-2 shadow-2xl backdrop-blur-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Say something to Littlewood..."
              disabled={status === "thinking"}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#52634d] outline-none placeholder:text-[#a49c8c] disabled:opacity-60 sm:text-base"
            />

            <button
              type="submit"
              disabled={!input.trim() || status === "thinking"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9684c7] text-white shadow-md transition-all hover:scale-105 hover:bg-[#8572b9] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>

          <p className="mt-3 text-center text-xs font-medium text-white drop-shadow-md">
            Chat with your friend in Littlewood 🌼
          </p>
        </footer>
      </div>
    </main>
  );
}
