# MediFlow AI
### Evolus AI Hackathon — Clinical Intelligence & Multimodal Agent Framework

> **A Clinical Intelligence Platform** addressing fragmented patient journeys, cross-doctor longitudinal continuity, multimodal prescription parsing, and a 3-tier clinical safety matrix with instant Rescue 1122 dispatch.

---

## 🏥 Architecture Overview

```
MediFlow-AI/
├── backend/                    # FastAPI, Python 3.12, SQLite fallback, Async OCR, 3-Tier Safety Matrix
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint, CORS & lifespan seeding
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic BaseSettings, AES-256 32-byte key & 64-hex secrets
│   │   │   └── security.py     # PHI/PII anonymization & token masking
│   │   ├── db/
│   │   │   ├── database.py     # Async SQLAlchemy with SQLite fallback
│   │   │   └── session.py      # Database startup & clinical demo seeding
│   │   ├── models/
│   │   │   └── clinical.py     # Patient, Prescription, Medication, Consultation, InteractionWarning
│   │   ├── schemas/
│   │   │   └── clinical.py     # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── triage.py       # 3-Tier Safety Matrix (Tier 1: Routine, Tier 2: Ambiguity, Tier 3: Emergency)
│   │   │   ├── interaction_checker.py # Drug-drug & allergy contraindication engine
│   │   │   ├── ocr_engine.py   # Multimodal OCR parsing with deterministic clinical fallback
│   │   │   └── history_aggregator.py # Formulates Physician Clinical Handover Profiles
│   │   └── api/v1/
│   │       ├── router.py       # Aggregated API router
│   │       └── endpoints/
│   │           ├── health.py   # Health status & AMD ROCm telemetry
│   │           ├── ingestion.py# POST /upload for prescription files (PDF/Images)
│   │           ├── chat.py     # POST /chat with 3-tier triage & multilingual responses
│   │           ├── timeline.py # GET /timeline & POST /timeline/toggle for daily schedule
│   │           └── history.py  # GET & POST /patient/summary for new doctor handover
│   ├── requirements.txt
│   └── .env
│
└── frontend/                   # Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS v4 / PostCSS
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # Includes suppressHydrationWarning on <body>
    │   │   ├── page.tsx        # Animated Landing Page with Bento Grid
    │   │   ├── dashboard/
    │   │   │   └── page.tsx    # Patient Hub (Upload, Extracted Meds, Daily Schedule Checklist)
    │   │   ├── doctor-summary/
    │   │   │   └── page.tsx    # Clean Clinical Handover View for New Physicians
    │   │   ├── chat/
    │   │   │   └── page.tsx    # AI Medical Chat with Instant Emergency 1122 Lockdown Modal
    │   │   └── globals.css     # Modern medical glassmorphism, radar scan animation
    │   ├── components/
    │   │   ├── Navbar.tsx      # Navigation header with AMD ROCm telemetry indicator
    │   │   ├── PrescriptionUploader.tsx # Drag-and-drop zone with animated radar sweep
    │   │   ├── TimelineView.tsx# Pill cards (Morning/Noon/Night/Bedtime) with toggle status
    │   │   ├── DoctorHandoffCard.tsx    # Past therapies, active drug conflicts, allergy badges
    │   │   ├── TriageAlertBanner.tsx    # Red emergency alert for Tier-3 lockdown with 1122 dialer
    │   │   └── LanguageSwitcher.tsx     # English / Nastaliq Urdu / Roman Urdu toggle
    │   ├── lib/
    │   │   └── api.ts          # Typed client communicating with backend with offline fallback
    │   └── types/
    │       └── index.ts        # Shared TypeScript interfaces
    ├── package.json
    └── postcss.config.mjs      # Configured with @tailwindcss/postcss
```

---

## ⚡ Key Features

1. **Multimodal Prescription Ingestion & OCR:**
   - Accepts JPG, PNG, and PDF prescription scans.
   - Extracts drug names, dosages, frequencies, course durations, and diagnostic notes.
   - Normalizes intake timings into 4 canonical care slots (Morning, Afternoon, Evening, Bedtime).

2. **Longitudinal Cross-Doctor Patient Record (Doctor-to-Doctor Continuity):**
   - Synthesizes patient history across multiple doctor consultations.
   - Formulates exportable "Physician Clinical Handover Profile" highlighting refractory symptoms, past treatment failures (e.g., Cefixime failure), active drug-drug conflicts, and allergy contraindications.

3. **3-Tier Clinical Safety Matrix:**
   - **Tier 1 (Routine Guidance):** Routine dosage timetable, adherence logging, care journey suggestions.
   - **Tier 2 (Ambiguity & Missing Context):** Flags unreadable handwriting or missing dosage; instructs patient to verify with doctor/pharmacist before swallowing medication.
   - **Tier 3 (Emergency Lockdown & Triage):** Detects red-flag acute clinical symptoms (acute chest pain, severe dyspnea, heavy bleeding, loss of consciousness). Blocks conversational suggestions and triggers an instant Emergency Lockdown with direct actions to call Rescue 1122.

4. **Trilingual Communication:**
   - Seamless switching between English, Urdu (Nastaliq typography), and Roman Urdu.

5. **AMD ROCm Hardware Telemetry:**
   - Reports live or simulated ROCm 6.1 HIP accelerator status, VRAM allocation, and compute partition telemetry.

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```
- API Base URL: `http://localhost:8080/api/v1`
- Swagger Interactive Docs: `http://localhost:8080/docs`

### 2. Frontend Setup (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Testing Backend
```bash
cd backend
python -m pytest tests/test_backend.py -v
```
All 10 tests verify:
- Cryptographic validation (64-hex secret, 32-byte AES key)
- AES-256-GCM encryption & PHI/PII anonymization
- Tier 1, Tier 2, and Tier 3 triage matrix triggers
- Drug-drug interaction and allergy contraindication detection
- API health, chat, timeline, and doctor handover endpoints.
