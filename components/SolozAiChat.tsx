"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SolozAiChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am SoloZ AI 🏕️, your travel community assistant. Ask me about our upcoming trips, detailed itineraries, prices, inclusions, or our farmer sponsorship program!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide the floating widget on any admin panel page
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Scroll to bottom when messages or loading states update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble connecting right now. Please try again in a few moments, or contact Akhil directly on WhatsApp (+91 99660 85310)."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = (query: string) => {
    sendMessage(query);
  };

  const suggestChips = [
    { label: "Upcoming Trips 🏕️", query: "Show me the details of your upcoming trips." },
    { label: "Are flights included? ✈️", query: "Are train tickets and flight tickets included in the trip price?" },
    { label: "Farmer Program 🌾", query: "Can you tell me about the free yatra program for farmers?" },
    { label: "How to Book? 📞", query: "How do I book or register for a trip?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Branded Bubble Button */}
      {!isOpen && (
        <div className="relative group">
          {showNotification && (
            <div className="absolute right-0 bottom-16 bg-stone-900 text-white text-[11px] font-semibold py-1.5 px-3.5 rounded-xl shadow-2xl border border-stone-800 whitespace-nowrap animate-bounce flex items-center gap-1.5 font-sans">
              <span>Chat with SoloZ AI</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}
                className="hover:text-soloz-primary ml-1 text-white"
                type="button"
              >
                <X size={10} />
              </button>
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open SoloZ AI Chat"
            type="button"
            className="size-14 rounded-full bg-stone-900 border-2 border-[#ea580c] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group-hover:border-[#ea580c] relative overflow-hidden"
          >
            {/* Pulsing Outer Ring */}
            <span className="absolute inset-0 rounded-full border-2 border-[#ea580c]/40 animate-ping pointer-events-none" />
            {/* Branded Logo representation */}
            <img 
              src="/logo.png" 
              alt="SoloZ Logo" 
              className="size-11 object-contain transition-transform duration-300 group-hover:rotate-12"
            />
          </button>
        </div>
      )}

      {/* Floating Chat Dialog Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[385px] h-[520px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-stone-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header Card */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-stone-800 border border-[#ea580c] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="SoloZ AI" className="size-8 object-contain" />
              </div>
              <div>
                <div className="font-display text-sm font-bold tracking-wider flex items-center gap-1">
                  SoloZ AI <Sparkles size={12} className="text-[#ea580c] fill-[#ea580c] animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase">Travel Guide Online</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white transition-colors p-1.5 hover:bg-stone-800 rounded-xl"
              aria-label="Close chat"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages List Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 scroll-smooth"
          >
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="size-7 rounded-full bg-stone-900 border border-[#ea580c]/30 flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="AI" className="size-5 object-contain" />
                  </div>
                )}
                <div 
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-[#ea580c] text-white rounded-tr-none shadow-md font-medium" 
                      : "bg-white text-stone-800 rounded-tl-none border border-stone-200/60 shadow-sm"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="size-7 rounded-full bg-stone-900 border border-[#ea580c]/30 flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="AI" className="size-5 object-contain" />
                </div>
                <div className="bg-white border border-stone-200/60 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1 shadow-sm">
                  <span className="size-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-stone-400 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Match Suggestion Chips */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex flex-wrap gap-1.5">
              {suggestChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggest(chip.query)}
                  type="button"
                  className="bg-white hover:bg-[#ea580c]/5 text-stone-700 hover:text-[#ea580c] border border-stone-200 hover:border-[#ea580c]/30 text-[10px] font-bold rounded-lg px-2.5 py-1.5 transition-all duration-300 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="p-3 border-t border-stone-200/80 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about our trips..."
              disabled={loading}
              className="flex-1 bg-stone-50 text-xs text-stone-900 placeholder:text-stone-400 rounded-xl px-4 py-3 outline-none border border-stone-200 focus:border-[#ea580c] focus:bg-white transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="size-10 rounded-xl bg-stone-900 hover:bg-[#ea580c] text-white flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:hover:bg-stone-900 cursor-pointer shadow-md shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
