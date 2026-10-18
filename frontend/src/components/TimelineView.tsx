"use client";

import React, { useState } from "react";
import { DailySchedule, Medication } from "@/types";
import {
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Check,
  Clock,
  Pill,
  Sparkles,
  Info,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface TimelineViewProps {
  schedule: DailySchedule;
  onStatusUpdated?: () => void;
}

export default function TimelineView({ schedule, onStatusUpdated }: TimelineViewProps) {
  const [localSlots, setLocalSlots] = useState(schedule.slots);
  const [totalTaken, setTotalTaken] = useState(schedule.total_taken);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const getSlotIcon = (slotId: string) => {
    switch (slotId.toLowerCase()) {
      case "morning":
        return <Sun className="w-5 h-5 text-amber-400" />;
      case "afternoon":
        return <SunMedium className="w-5 h-5 text-orange-400" />;
      case "evening":
        return <Sunset className="w-5 h-5 text-rose-400" />;
      case "bedtime":
        return <Moon className="w-5 h-5 text-indigo-400" />;
      default:
        return <Clock className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleToggle = async (med: Medication) => {
    const nextState = !med.taken_today;
    setTogglingId(med.id);

    try {
      await api.toggleMedication(med.id, nextState);

      // Optimistic state update across slots
      let newTakenCount = totalTaken;
      const updated = localSlots.map((slot) => {
        return {
          ...slot,
          items: slot.items.map((item) => {
            if (item.id === med.id) {
              if (nextState && !item.taken_today) newTakenCount += 1;
              if (!nextState && item.taken_today) newTakenCount = Math.max(0, newTakenCount - 1);
              return { ...item, taken_today: nextState };
            }
            return item;
          }),
        };
      });

      setLocalSlots(updated);
      setTotalTaken(newTakenCount);
      if (onStatusUpdated) onStatusUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const totalScheduled = schedule.total_scheduled || 1;
  const adherenceRate = Math.min(100, Math.round((totalTaken / totalScheduled) * 100));

  return (
    <div className="w-full space-y-6">
      {/* Adherence Progress Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Today's Treatment Plan
            </span>
            <h3 className="text-xl font-extrabold text-white">Daily Medication Timetable</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">{adherenceRate}%</span>
              <p className="text-[11px] text-slate-400">
                {totalTaken} of {totalScheduled} doses taken
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Pill className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      {/* 4 Daily Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {localSlots.map((slot) => (
          <div
            key={slot.slot_id}
            className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
          >
            {/* Slot Header */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-white/10">
                    {getSlotIcon(slot.slot_id)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{slot.slot_name}</h4>
                    <span className="text-[11px] font-mono text-cyan-400">{slot.time_label}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  {slot.items.length} {slot.items.length === 1 ? "med" : "meds"}
                </span>
              </div>

              {/* Pill Cards */}
              <div className="space-y-3.5">
                {slot.items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">
                    No medications scheduled for this slot.
                  </div>
                ) : (
                  slot.items.map((med) => {
                    const isTaken = med.taken_today;
                    const isToggling = togglingId === med.id;

                    return (
                      <div
                        key={med.id}
                        className={`rounded-xl p-3.5 border transition-all duration-200 ${
                          isTaken
                            ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200"
                            : "bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-sm text-white">{med.name}</h5>
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {med.dosage}
                              </span>
                            </div>
                            {med.generic_name && (
                              <p className="text-[11px] text-slate-400 font-medium">
                                {med.generic_name}
                              </p>
                            )}
                          </div>

                          {/* Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggle(med)}
                            disabled={isToggling}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              isTaken
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-slate-800 text-slate-500 border border-white/10 hover:text-white hover:border-emerald-500/50"
                            }`}
                            title={isTaken ? "Mark as Pending" : "Mark as Taken"}
                          >
                            <Check
                              className={`w-4 h-4 transition-transform ${
                                isTaken ? "scale-100" : "scale-75 opacity-40"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Instructions & Food Intake Tip */}
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {med.instructions}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">{med.frequency}</span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full ${
                              isTaken
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {isTaken ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
