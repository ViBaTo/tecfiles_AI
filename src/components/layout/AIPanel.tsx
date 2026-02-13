"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy el asistente IA de Dossier. Puedo ayudarte con tus fichas tecnicas, extraer informacion de planos o responder preguntas sobre tus productos.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Esta funcionalidad esta en desarrollo. Pronto podras interactuar con la IA directamente desde aqui.",
      },
    ]);
    setInput("");
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
            <Sparkles size={16} className="text-[#1e3a5f]" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-slate-900">Asistente IA</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
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
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre esta ficha..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
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
