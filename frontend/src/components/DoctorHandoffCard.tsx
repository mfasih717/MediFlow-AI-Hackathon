"use client";

import React from "react";
import { DoctorHandoverProfile } from "@/types";
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Stethoscope,
  Printer,
  Sparkles,
  ArrowRight,
  Pill,
} from "lucide-react";

interface DoctorHandoffCardProps {
  profile: DoctorHandoverProfile;
}

export default function DoctorHandoffCard({ profile }: DoctorHandoffCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card: Patient Demographics & Action Bar */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Doctor-to-Doctor Continuity
              </span>
              <span className="text-xs font-mono text-slate-400">MRN: {profile.mrn}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Physician Clinical Handover Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Consolidated longitudinal care summary generated for secondary consultation. Highlights
              refractory symptoms, past treatment failures, and active drug-drug conflict matrix.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print / Export Profile</span>
            </button>
          </div>
        </div>

        {/* Demographics & Critical Allergy Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-6">
          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Patient Name</span>
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              {profile.patient_demographics.full_name_masked}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Age & Gender</span>
            <span className="font-bold text-sm text-white">
              {profile.patient_demographics.age} yrs • {profile.patient_demographics.gender}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Blood Group</span>
            <span className="font-bold text-sm text-emerald-400">
              {profile.patient_demographics.blood_group}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-white/5 col-span-2 lg:col-span-2">
            <span className="text-[11px] text-rose-300 font-semibold block mb-1">
              Verified Drug Allergies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drug Interactions & Conflict Warnings Section */}
      {profile.drug_interactions && profile.drug_interactions.length > 0 && (
        <div className="glass-emergency-glow rounded-3xl p-6 border border-rose-500/40">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Active Drug-Drug & Allergy Contraindication Matrix
              </h3>
              <p className="text-xs text-rose-200">
                Automated clinical safety rules identified risks requiring immediate physician review.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.drug_interactions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/70 p-4 border border-rose-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-emerald-400">{item.drug_a}</span>
                    <span className="text-slate-500">↔</span>
                    <span className="text-rose-400">{item.drug_b}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500 text-white">
                    {item.severity} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.mechanism}</p>
                <div className="pt-2 border-t border-white/5 text-xs text-emerald-300 flex items-start gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <span>Recommendation: {item.action_required}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Chief Complaints Timeline & Treatment Failures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Longitudinal Timeline Across Doctors */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Doctor Consultations & Complaint Progression
            </h3>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-emerald-400 before:to-slate-700">
            {profile.chief_complaints_timeline.map((item, index) => (
              <div key={index} className="relative">
                <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#070c14]" />
                <div className="rounded-xl bg-slate-900/70 p-4 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.doctor}</span>
                    <span className="font-mono text-slate-400">{item.visit_date}</span>
                  </div>
                  <span className="text-[11px] text-cyan-300 block">{item.specialty} • {item.clinic}</span>
                  <p className="text-xs text-slate-300 font-medium pt-1">
                    "{item.chief_complaint}"
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Outcome: <span className="text-amber-300">{item.outcome}</span> — {item.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Failure & Ineffective Therapies Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Documented Treatment Failures & Refractory Lines
            </h3>
          </div>

          <div className="space-y-3.5">
            {profile.treatment_failures.map((fail, i) => (
              <div
                key={i}
                className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">Attempted: {fail.attempted_therapy}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{fail.date}</span>
                </div>
                <p className="text-slate-300">{fail.failure_rationale}</p>
                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  Prescribed by: {fail.doctor_name} ({fail.specialty})
                </div>
              </div>
            ))}

            {/* Recommendations for the New Doctor */}
            <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Actionable Physician Recommendations:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {profile.new_doctor_recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Active vs Discontinued Medications Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-emerald-400" />
          Medication Regimen Continuity (Active vs Discontinued)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">Medication</th>
                <th className="pb-3 font-semibold">Dosage & Route</th>
                <th className="pb-3 font-semibold">Timing / Slot</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Clinical Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profile.active_medications.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {m.name}
                    {m.generic_name && (
                      <span className="text-slate-400 font-normal">({m.generic_name})</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">{m.dosage} ({m.route})</td>
                  <td className="py-3 text-cyan-300 font-mono">{m.timing_slots}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{m.instructions}</td>
                </tr>
              ))}

              {profile.discontinued_medications.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors opacity-75">
                  <td className="py-3 font-medium text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="line-through">{m.name}</span>
                  </td>
                  <td className="py-3 text-slate-400">{m.dosage} ({m.route})</td>
                  <td className="py-3 text-slate-500 font-mono">—</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      DISCONTINUED
                    </span>
                  </td>
                  <td className="py-3 text-rose-300 italic">{m.side_effects_noted || "Ineffective course"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
