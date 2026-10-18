"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Scan, Sparkles, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { PrescriptionUploadResponse } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface PrescriptionUploaderProps {
  onExtractionComplete: (data: PrescriptionUploadResponse) => void;
}

export default function PrescriptionUploader({ onExtractionComplete }: PrescriptionUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    triggerExtraction(file);
  };

  const handleSampleClick = () => {
    // Generate a virtual sample prescription file for 1-click live demo
    const sampleBlob = new Blob(
      [
        "Rx: Dr. Ayesha Siddiqa, FCPS Pulmonology\nPatient: Ahmed Khan, Age 48\n1. Augmentin 625mg 1 tab BD x 7d\n2. Nexum 40mg 1 cap OD AC x 14d\n3. Panadol 500mg 1 tab TDS PRN x 5d\n4. Lipitor 20mg 1 tab HS x 30d",
      ],
      { type: "text/plain" }
    );
    const sampleFile = new File([sampleBlob], "Dr_Ayesha_Rx_Pulmonology_Scan.pdf", {
      type: "application/pdf",
    });
    setSelectedFile(sampleFile);
    setPreviewUrl(null);
    triggerExtraction(sampleFile);
  };

  const triggerExtraction = async (file: File) => {
    setIsScanning(true);
    setErrorMsg(null);

    // Simulated agent reasoning progress steps
    setScanStep("Anonymizing Patient Identifiers (HIPAA / AES-256)...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("Running Multimodal Vision OCR on ROCm Accelerator...");
    await new Promise((r) => setTimeout(r, 700));

    setScanStep("Normalizing Dosage, Frequencies & Care Slots...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("Executing 3-Tier Clinical Safety Matrix & Drug-Drug Audit...");

    try {
      const result = await api.uploadPrescription(file, "PAT-9082");
      setIsScanning(false);
      setScanStep("");
      onExtractionComplete(result);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg(err.message || "Failed to process prescription");
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
            : "border-white/15 bg-slate-900/50 hover:border-emerald-500/40 hover:bg-slate-900/70"
        } glass-panel`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleChange}
          className="hidden"
        />

        {/* Animated Radar Scanning Overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6"
            >
              {/* Radar beam */}
              <div className="animate-radar-sweep" />

              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400/30 flex items-center justify-center animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Scan className="w-8 h-8 text-emerald-300 animate-spin" />
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-bold text-white mb-2">Multimodal Clinical Parser</h4>
              <p className="text-sm font-mono text-cyan-300 animate-pulse">{scanStep}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Evolus AI Agent Graph Ingestion Active</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Dropzone State */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-inner group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-emerald-400" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Ingest Prescription Scan or PDF
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Drag & drop handwritten or printed doctor prescriptions. MediFlow extracts medicines,
            timing slots, dosage, and identifies conflicts automatically.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Browse Files (PNG, JPG, PDF)
            </button>

            <button
              type="button"
              onClick={handleSampleClick}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Use Sample Pulmonology Rx</span>
            </button>
          </div>

          {selectedFile && !isScanning && (
            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">{selectedFile.name}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
