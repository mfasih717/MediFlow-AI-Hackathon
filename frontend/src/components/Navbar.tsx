"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  Menu,
  X,
  Cpu,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/dashboard", label: "Patient Hub", icon: Calendar },
    { href: "/doctor-summary", label: "Doctor Handover", icon: FileText },
    { href: "/chat", label: "AI Consultation", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070c14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070c14] rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-300 bg-clip-text text-transparent">
                MediFlow
              </span>
              <span className="text-xs uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              Clinical Intelligence & Continuity
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Telemetry Indicator & 1122 Hotline */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-cyan-300">AMD ROCm HIP 6.1</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <a
            href="tel:1122"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold transition-all shadow-sm group"
            title="Immediate Emergency Hotline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400 group-hover:text-white transition-colors animate-bounce" />
            <span>Rescue 1122</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#070c14]/95 px-4 pt-2 pb-6 space-y-2 backdrop-blur-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> AMD ROCm Acceleration Active
            </span>
            <a
              href="tel:1122"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 1122
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
