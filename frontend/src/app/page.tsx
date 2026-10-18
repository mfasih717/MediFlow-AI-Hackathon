"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Calendar,
  FileText,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight,
  Cpu,
  Lock,
  HeartPulse,
  Scan,
  AlertTriangle,
  Globe,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { HealthStatus } from "@/types";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Hackathon & Hardware Chip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-sm shadow-emerald-500/20 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Evolus AI Hackathon — Clinical Intelligence Track</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
            >
              Transforming Prescriptions into{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Continuous Clinical Care
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              MediFlow AI parses messy prescription scans into structured daily schedules, audits
              cross-doctor treatment failures, and locks conversation during red-flag emergencies with
              instant Rescue 1122 dispatch.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95"
              >
                <span>Launch Patient Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/doctor-summary"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-sm backdrop-blur-md transition-all hover:border-emerald-500/40"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Doctor Handover Profile</span>
              </Link>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-300 border border-white/5 font-semibold text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Clinical AI Chat</span>
              </Link>
            </motion.div>

            {/* Hardware Telemetry Badge */}
            <div className="mt-12 inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-slate-400 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-300">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-mono">
                  {health?.rocm_telemetry.device_name || "AMD ROCm 6.1 HIP Acceleration"}
                </span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>AES-256 PHI Anonymized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento-Grid Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-extrabold">
              Multimodal Agent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              End-to-End Clinical Intelligence Matrix
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Engineered specifically for outpatient clinical journeys, addressing fragmented history
              and high-risk prescription ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: Multimodal OCR Extraction (Span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Scan className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Multimodal Vision
                  </span>
                  <span className="text-xs text-slate-400">0.4s Ingestion</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Multimodal OCR & Handwriting Extraction
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Extracts raw handwritten and printed prescriptions into structured clinical entities:
                  drug names, exact dosages, course durations, and dietary rules with deterministic fallback.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Input: Doctor Rx Scan (PNG/PDF)</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Structured Entities
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    Augmentin 625mg BD
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    Nexum 40mg OD
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    Lipitor 20mg HS
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: 3-Tier Safety Matrix (Span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Clinical Guardrails
                  </span>
                  <span className="text-xs text-slate-400">Strict Triage</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  3-Tier Clinical Safety Matrix
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Guarantees patient safety with automated tier escalation: routine guidance (Tier 1),
                  unreadable handwriting clarification (Tier 2), and acute red-flag emergency lockdown (Tier 3).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold block">Tier 1</span>
                  <span className="text-[10px] text-slate-400">Routine Safe</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
                  <span className="font-bold block">Tier 2</span>
                  <span className="text-[10px] text-slate-400">Clarification</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 animate-pulse">
                  <span className="font-bold block">Tier 3</span>
                  <span className="text-[10px] text-red-400">Emergency 1122</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Doctor Handover Profile (Span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 mb-2 inline-block">
                Doctor-to-Doctor Continuity
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Longitudinal Cross-Doctor Handover
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                When patients switch doctors due to unresolved symptoms, MediFlow generates a clean
                clinical profile showing past treatment failures (e.g. Cefixime failure), active drug
                overlaps, and allergy conflicts.
              </p>
              <Link
                href="/doctor-summary"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 pt-2"
              >
                <span>Inspect Sample Handover Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bento Card 4: Rescue 1122 Emergency Lockdown (Span 1) */}
            <div className="glass-emergency-glow rounded-3xl p-8 border border-red-500/40 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 mb-2 inline-block font-bold">
                  Tier-3 Protocol
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Emergency 1122 Lockdown
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Detects chest pain, severe dyspnea, and collapse in English, Nastaliq Urdu, and Roman
                  Urdu with direct 1122 dispatch dialer.
                </p>
              </div>

              <a
                href="tel:1122"
                className="w-full text-center py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/40 transition-all"
              >
                Direct Call 1122
              </a>
            </div>

            {/* Bento Card 5: Multilingual Nastaliq Urdu (Span 1) */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 mb-2 inline-block">
                  Trilingual Assistant
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Bilingual Urdu & Roman Urdu
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Native Nastaliq Urdu typography and Roman Urdu communication for accessible patient
                  guidance across Pakistan.
                </p>
              </div>

              <div className="text-right p-3 rounded-xl bg-slate-900/60 border border-white/5 font-urdu text-sm text-emerald-300">
                کھانے کے بعد آگمنٹن لیں اور مکمل کورس کریں۔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Experience MediFlow AI in Action
              </h2>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                Try prescription ingestion with the radar scanner, interact with today's medication
                timeline, inspect doctor-to-doctor clinical handovers, or test emergency 1122 chat triage.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all"
                >
                  Go to Patient Hub
                </Link>
                <Link
                  href="/chat"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all"
                >
                  Test Emergency Triage Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
