"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, RotateCcw } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hola, soy el asistente IA de Dossier. Puedo responder preguntas sobre tus fichas técnicas y productos. ¿En qué puedo ayudarte?",
};

export function AIPanel() {
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([WELCOME_MESSAGE]);
    setIsLoading(false);
    setInput("");
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    const conversationMessages = [
      ...messages.filter((m) => m.id !== "welcome"),
      userMessage,
    ].map((m) => ({ role: m.role, content: m.content }));

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          tenantId: tenant?.id,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Error del servidor (${response.status})`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        const currentText = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: currentText } : m
          )
        );
      }

      if (!accumulated) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: "No pude generar una respuesta. Inténtalo de nuevo." }
              : m
          )
        );
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      const errorMsg =
        error instanceof Error ? error.message : "Error inesperado";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: `Lo siento, ocurrió un error: ${errorMsg}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-150 ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Sparkles size={20} strokeWidth={1.5} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-[#1e3a5f]"
              strokeWidth={1.5}
            />
            <span className="text-sm font-semibold text-slate-900">
              Asistente IA
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Nueva conversación"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`rounded-lg p-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-100"
                }`}
              >
                {message.content ? (
                  message.role === "assistant" ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    message.content
                  )
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                isLoading ? "Pensando..." : "Pregunta sobre tus productos..."
              }
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
    </span>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIdx) => {
        const lines = block.split("\n");

        // Detect bullet list: all non-empty lines start with - or *
        const isBulletList = lines.every(
          (l) => l.trim() === "" || /^[\-\*]\s/.test(l.trim())
        );
        if (isBulletList && lines.some((l) => l.trim() !== "")) {
          return (
            <ul key={blockIdx} className="list-disc list-inside space-y-0.5">
              {lines
                .filter((l) => l.trim() !== "")
                .map((line, i) => (
                  <li key={i}>
                    {renderInlineMarkdown(line.replace(/^[\-\*]\s*/, ""))}
                  </li>
                ))}
            </ul>
          );
        }

        // Detect numbered list: all non-empty lines start with digit.
        const isNumberedList = lines.every(
          (l) => l.trim() === "" || /^\d+[\.\)]\s/.test(l.trim())
        );
        if (isNumberedList && lines.some((l) => l.trim() !== "")) {
          return (
            <ol
              key={blockIdx}
              className="list-decimal list-inside space-y-0.5"
            >
              {lines
                .filter((l) => l.trim() !== "")
                .map((line, i) => (
                  <li key={i}>
                    {renderInlineMarkdown(
                      line.replace(/^\d+[\.\)]\s*/, "")
                    )}
                  </li>
                ))}
            </ol>
          );
        }

        // Regular paragraph (may contain single line breaks)
        return (
          <p key={blockIdx}>
            {lines.map((line, i) => (
              <span key={i}>
                {renderInlineMarkdown(line)}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
