"use client";

import React from "react";
import { Language } from "@/types";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const languages: { id: Language; label: string; script?: string }[] = [
    { id: "en", label: "English" },
    { id: "ur", label: "اردو", script: "font-urdu" },
    { id: "roman_ur", label: "Roman Urdu" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-white/10 rounded-xl backdrop-blur-md">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
      {languages.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onLanguageChange(l.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
            currentLanguage === l.id
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          } ${l.script || ""}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
