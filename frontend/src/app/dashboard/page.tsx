"use client";

import React, { useState, useEffect } from "react";
import PrescriptionUploader from "@/components/PrescriptionUploader";
import TimelineView from "@/components/TimelineView";
import TriageAlertBanner from "@/components/TriageAlertBanner";
import { api } from "@/lib/api";
import {
  DailySchedule,
  PrescriptionUploadResponse,
  TriageResult,
  Medication,
} from "@/types";
import {
  FileText,
  Pill,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [lastUploadResult, setLastUploadResult] = useState<PrescriptionUploadResponse | null>(null);
  const [triageAlert, setTriageAlert] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const data = await api.getDailySchedule("PAT-9082");
      setSchedule(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleExtractionComplete = (data: PrescriptionUploadResponse) => {
    setLastUploadResult(data);
    if (data.triage && data.triage.tier > 1) {
      setTriageAlert(data.triage);
    }
    // Refresh schedule to reflect newly uploaded medications
    fetchSchedule();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Header Card */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Patient Care Hub
            </span>
            <span className="text-xs font-mono text-slate-400">MRN: MRN-PK-78219</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, Ahmed Khan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Active Treatment: Acute Lower Respiratory Infection & Dyslipidemia Management
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/doctor-summary"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-all shadow-md"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Doctor Handover View</span>
          </Link>
          <Link
            href="/chat"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Triage Alert Banner if any flagged */}
      <TriageAlertBanner
        triage={triageAlert}
        onDismiss={() => setTriageAlert(null)}
      />

      {/* Main Grid: Upload Dropzone & Extracted Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ingestion Zone (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Upload New Prescription</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Ingest a photo or PDF scan. Our Multimodal OCR engine automatically normalizes medications
              and updates your daily timeline.
            </p>
            <PrescriptionUploader onExtractionComplete={handleExtractionComplete} />
          </div>

          {/* Quick Continuity Note */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cross-Doctor Safety Guard</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every uploaded prescription is audited against past treatment failures and verified
              allergies (e.g. Penicillin) to prevent contraindicated therapies.
            </p>
          </div>
        </div>

        {/* Right Column: Extracted Medications Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Active Extracted Prescriptions</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {lastUploadResult ? "Latest Scan Extracted" : "Current Regimen"}
            </span>
          </div>

          {/* Extracted Card Container */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
            {lastUploadResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {lastUploadResult.prescription.doctor_name}
                    </span>
                    <span className="font-mono text-slate-400">
                      {lastUploadResult.prescription.date_prescribed}
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-300 block">
                    {lastUploadResult.prescription.hospital_clinic}
                  </span>
                  <p className="text-xs text-slate-300">
                    <strong className="text-emerald-300">Diagnostic Intent:</strong>{" "}
                    {lastUploadResult.prescription.diagnostic_intent}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Extracted Medications ({lastUploadResult.extracted_count})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lastUploadResult.prescription.medications.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl p-3.5 bg-slate-900/60 border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{m.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {m.dosage}
                          </span>
                        </div>
                        {m.generic_name && (
                          <p className="text-[11px] text-slate-400">{m.generic_name}</p>
                        )}
                        <p className="text-xs text-cyan-300 font-mono">{m.frequency}</p>
                        <p className="text-[11px] text-slate-400">{m.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {lastUploadResult.doctor_instructions && (
                  <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/30 p-3.5 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Special Precautions & Dietary Advice
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {lastUploadResult.doctor_instructions}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Default Baseline Regimen Display */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Dr. Ayesha Siddiqa, FCPS (Pulmonology)</span>
                    <span className="font-mono text-slate-400">Current Care Plan</span>
                  </div>
                  <span className="text-[11px] text-cyan-300 block">
                    National Hospital & Medical Centre, Lahore
                  </span>
                  <p className="text-xs text-slate-300">
                    <strong className="text-emerald-300">Diagnosis:</strong> Acute Lower Respiratory
                    Infection & Reflux Micro-aspiration
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl p-3.5 bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">Augmentin</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        625mg
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Amoxicillin + Clavulanate</p>
                    <p className="text-xs text-cyan-300 font-mono">1 tab BD (Subha / Shaam)</p>
                    <p className="text-[11px] text-slate-400">Take with meals. 7-day course.</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">Nexum</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        40mg
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Esomeprazole</p>
                    <p className="text-xs text-cyan-300 font-mono">1 cap OD (Nahar munh)</p>
                    <p className="text-[11px] text-slate-400">30 min before breakfast with water.</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">Panadol</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        500mg
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Paracetamol</p>
                    <p className="text-xs text-cyan-300 font-mono">1 tab TDS PRN</p>
                    <p className="text-[11px] text-slate-400">Take after meals for fever/pain.</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">Lipitor</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        20mg
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Atorvastatin</p>
                    <p className="text-xs text-cyan-300 font-mono">1 tab HS (Bedtime)</p>
                    <p className="text-[11px] text-slate-400">Before sleeping. Avoid grapefruit juice.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Schedule & Interactive Pill Checklist */}
      <div className="pt-4">
        {schedule && (
          <TimelineView
            schedule={schedule}
            onStatusUpdated={fetchSchedule}
          />
        )}
      </div>
    </div>
  );
}
