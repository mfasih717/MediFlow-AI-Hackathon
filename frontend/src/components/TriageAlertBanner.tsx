"use client";

import React from "react";
import { TriageResult } from "@/types";
import { AlertTriangle, PhoneCall, ShieldAlert, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TriageAlertBannerProps {
  triage: TriageResult | null;
  onDismiss?: () => void;
}

export default function TriageAlertBanner({ triage, onDismiss }: TriageAlertBannerProps) {
  if (!triage || triage.tier === 1) return null;

  const isTier3 = triage.tier === 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-2xl p-5 mb-6 shadow-2xl ${
          isTier3
            ? "glass-emergency-glow border-red-500/50 bg-red-950/40 text-red-100"
            : "glass-panel border-amber-500/40 bg-amber-950/30 text-amber-100"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl flex-shrink-0 ${
                isTier3 ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/30 animate-pulse" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {isTier3 ? <ShieldAlert className="w-7 h-7" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                    isTier3 ? "bg-red-500 text-white" : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isTier3 ? "Tier 3: Emergency Lockdown" : "Tier 2: Ambiguity / Clarification Required"}
                </span>
                {triage.dialer_number && (
                  <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                    Emergency Line: 1122
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {isTier3 ? "Immediate Emergency Protocol Engaged" : "Prescription Verification Necessary"}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl">{triage.message}</p>

              {/* Detected Red Flags Chips */}
              {triage.detected_red_flags && triage.detected_red_flags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Triggers detected:</span>
                  {triage.detected_red_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white font-mono border border-white/10"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0">
            {isTier3 && (
              <a
                href="tel:1122"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/40 transition-all transform hover:scale-105 active:scale-95"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Call Rescue 1122 Now</span>
              </a>
            )}

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
