"use client";

import React, { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TriageAlertBanner from "@/components/TriageAlertBanner";
import { api } from "@/lib/api";
import { ChatMessage, Language, TriageResult } from "@/types";
import {
  Send,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  User,
  Bot,
  AlertTriangle,
  RotateCcw,
  Clock,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am MediFlow Clinical AI. I can explain your prescription timetable, food precautions, and monitor your symptoms under the 3-Tier Clinical Safety Matrix. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState<TriageResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, emergencyLockdown]);

  // Quick prompt buttons tailored to demonstrate 3-Tier Safety Matrix
  const samplePrompts = [
    {
      label: "When to take Nexum?",
      text: "When should I take my morning Nexum capsule?",
      tier: "Tier 1: Routine",
    },
    {
      label: "Augmentin with meals?",
      text: "Can I take Augmentin with food to avoid stomach upset?",
      tier: "Tier 1: Routine",
    },
    {
      label: "Blurry Dosage Warning",
      text: "The handwriting is blurry and dosage is missing on the scan.",
      tier: "Tier 2: Ambiguity",
    },
    {
      label: "🚨 Chest Pain (Emergency)",
      text: "I am feeling severe acute chest pain and shortness of breath.",
      tier: "Tier 3: 1122 Lockdown",
    },
    {
      label: "🚨 سینے میں شدید درد",
      text: "مجھے سینے میں شدید درد ہو رہا ہے اور سانس پھول رہی ہے",
      tier: "Tier 3: Nastaliq Urdu",
      script: "font-urdu",
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(text, language, "PAT-9082");

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        triage: response.triage,
        suggested_actions: response.suggested_actions,
        agent_route: response.agent_route,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Check if Tier-3 Emergency Lockdown triggered
      if (response.triage && response.triage.tier === 3) {
        setEmergencyLockdown(response.triage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLockdown = () => {
    setEmergencyLockdown(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: "system",
        content: "Emergency lockdown released for clinical demo session.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Chat Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Multimodal Assistant
            </span>
            <span className="text-xs text-slate-400">Context: Ahmed Khan (MRN-PK-78219)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Clinical AI Consultation</h1>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            currentLanguage={language}
            onLanguageChange={(newLang) => setLanguage(newLang)}
          />
        </div>
      </div>

      {/* Triage Banner if Emergency Lockdown active */}
      <TriageAlertBanner triage={emergencyLockdown} />

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 min-h-[460px] max-h-[560px] overflow-y-auto space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isEmergency = msg.triage?.tier === 3;
            const isClarification = msg.triage?.tier === 2;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isEmergency
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {isEmergency ? <ShieldAlert className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md"
                      : isEmergency
                      ? "bg-red-950/40 border border-red-500/50 text-red-100 rounded-tl-none shadow-xl"
                      : isClarification
                      ? "bg-amber-950/30 border border-amber-500/40 text-amber-100 rounded-tl-none"
                      : "bg-slate-900/80 border border-white/10 text-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* Tier Status Badge if present */}
                  {msg.triage && msg.triage.tier > 1 && (
                    <div className="mb-2 flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                      {msg.triage.tier === 3 ? (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                          🚨 Tier 3: Emergency Lockdown
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                          ⚠️ Tier 2: Clarification Required
                        </span>
                      )}
                    </div>
                  )}

                  <p
                    className={`whitespace-pre-line ${
                      language === "ur" ? "font-urdu text-base leading-loose" : ""
                    }`}
                  >
                    {msg.content}
                  </p>

                  {/* Suggested Follow-up Action Chips */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                      {msg.suggested_actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(act)}
                          disabled={!!emergencyLockdown}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors font-medium cursor-pointer"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] opacity-60 text-right mt-1.5 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic py-2">
              <Bot className="w-5 h-5 text-emerald-400 animate-spin" />
              <span>MediFlow Clinical Agent evaluating clinical rules...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts to Test Safety Tiers */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Quick Demo Prompts (Test 3-Tier Safety Matrix):
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={!!emergencyLockdown}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                p.tier.includes("Tier 3")
                  ? "bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50"
                  : p.tier.includes("Tier 2")
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/50"
                  : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800"
              } ${p.script || ""}`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="glass-panel rounded-2xl p-2.5 border border-white/10">
        {emergencyLockdown ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              <span>
                <strong>Chat Locked:</strong> Tier-3 Emergency triggered. Automated conversation is
                restricted during acute red-flag presentation.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href="tel:1122"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>Call 1122</span>
              </a>
              <button
                type="button"
                onClick={handleResetLockdown}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                title="Unlock for testing"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === "ur"
                  ? "طبی سوال یا علامات یہاں لکھیں..."
                  : language === "roman_ur"
                  ? "Tibbi sawal ya alamat yahan likhein..."
                  : "Ask about dosage times, food intake, side effects, or report symptoms..."
              }
              className={`flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none ${
                language === "ur" ? "font-urdu text-right text-base" : ""
              }`}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Emergency Lockdown High-Contrast Modal (Tier 3) */}
      <AnimatePresence>
        {emergencyLockdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-emergency-glow rounded-3xl p-8 max-w-lg w-full border-2 border-red-500 text-center space-y-6 shadow-2xl bg-red-950/70"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-400 animate-pulse">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-red-500 text-white">
                  Tier 3: Emergency Lockdown Active
                </span>
                <h3 className="text-2xl font-black text-white mt-3 mb-2">
                  Acute Clinical Red-Flags Detected
                </h3>
                <p className="text-sm text-red-100 leading-relaxed font-medium">
                  {emergencyLockdown.message}
                </p>
              </div>

              {emergencyLockdown.detected_red_flags && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {emergencyLockdown.detected_red_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-white font-mono border border-white/20"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 space-y-3">
                <a
                  href="tel:1122"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-2xl shadow-red-600/50 transition-all transform hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                  <span>Call Rescue 1122 Immediately</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetLockdown}
                  className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto cursor-pointer"
                >
                  Dismiss / Resume Demo Simulation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
