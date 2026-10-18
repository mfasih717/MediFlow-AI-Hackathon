import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MediFlow AI | Clinical Intelligence & Multimodal Agent Framework",
  description:
    "Evolus AI Hackathon — Transforming prescription scans into longitudinal clinical handover profiles, daily schedules, and 3-Tier safety matrix.",
  keywords: [
    "Healthcare AI",
    "Clinical Intelligence",
    "Prescription OCR",
    "Drug Interactions",
    "Doctor Handover",
    "Evolus AI",
    "Rescue 1122",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#070c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="fixed inset-0 pointer-events-none bg-medical-grid opacity-60 z-0" />
        
        {/* Ambient Top Glow Orbs */}
        <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
        <div className="fixed top-[15%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          
          {/* Global Footer */}
          <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-300">MediFlow AI</span>
                <span>— Evolus AI Hackathon Clinical Intelligence Track</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>3-Tier Clinical Safety Matrix</span>
                <span>•</span>
                <span>Rescue 1122 Protocol Active</span>
                <span>•</span>
                <span className="text-emerald-400">HIPAA/AES-256 Compliant</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
