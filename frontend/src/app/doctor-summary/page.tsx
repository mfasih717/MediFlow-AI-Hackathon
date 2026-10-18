"use client";

import React, { useState, useEffect } from "react";
import DoctorHandoffCard from "@/components/DoctorHandoffCard";
import { api } from "@/lib/api";
import { DoctorHandoverProfile } from "@/types";
import { FileText, RefreshCw, Stethoscope, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DoctorSummaryPage() {
  const [profile, setProfile] = useState<DoctorHandoverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctorHandoverSummary("PAT-9082");
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Hub</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Evolus AI Longitudinal Record
          </span>
          <button
            type="button"
            onClick={fetchProfile}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Profile</span>
          </button>
        </div>
      </div>

      {/* Main Handover Content */}
      {loading && !profile ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Aggregating Cross-Doctor Longitudinal History...</h3>
          <p className="text-xs text-slate-400">
            Synthesizing past therapies, treatment failures, and active drug-drug contraindications.
          </p>
        </div>
      ) : profile ? (
        <DoctorHandoffCard profile={profile} />
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-sm">
          Unable to load physician handover profile. Please verify backend connection.
        </div>
      )}
    </div>
  );
}
