# 🏥 MediFlow AI — Privacy-First Clinical Co-Pilot & Patient Journey Assistant

[![AMD ROCm](https://img.shields.io/badge/AMD-ROCm_6.x-ED1C24?style=flat&logo=amd)](https://rocm.docs.amd.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_Workflow-1C3C3C?style=flat)](https://github.com/langchain-ai/langgraph)
[![Python](https://img.shields.io/badge/Python-3.11_%7C_3.12-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Clinical Tests](https://img.shields.io/badge/Tests-100%25_Benchmark_Passing-brightgreen?style=flat)](#-evaluation--benchmarks)

MediFlow AI is an intelligent, privacy-first bilingual Clinical Co-Pilot and Patient Care Journey Assistant. Designed specifically for healthcare environments, it combines **LangGraph multi-tier clinical safety guardrails**, document OCR & entity extraction, and **strict zero-PHI local hardware inference** powered by AMD ROCm 6.x and local vLLM.

---

## 🌟 Key Capabilities

### Deterministic 3-Tier Clinical Safety Matrix:
* **Tier 1 (Routine):** Validated prescriptions generate chronological medication timetables, food association guidance, and bilingual patient instructions.
* **Tier 2 (Clarification & Ambiguity):** Scans with low OCR confidence (<75%), unreadable frequencies, missing dosages, or potential pharmacological overdoses trigger structured bilingual clarification questions before a schedule is published.
* **Tier 3 (Emergency Lockdown):** Deterministic red-flag detection (crushing chest pain, severe dyspnea, anaphylactic shock, facial droop/slurred speech, massive hemorrhage) immediately freezes automated workflows, surfaces **Rescue 1122 / 911** directives, and halts scheduling.

### Strict Zero-PHI Local Hardware Isolation:
* Enforces local loopback (`127.0.0.1`) and private cluster boundaries.
* Explicitly blocks commercial cloud LLM hosts (`api.openai.com`, `api.anthropic.com`, etc.) to prevent patient health data leakage.
* Automatic masking of Pakistani CNIC (hyphenated and unhyphenated), mobile numbers, and emails before LLM reasoning.

### Bilingual Cultural Adaptation:
* Full support for English, Nastaliq Urdu (اردو), and Roman Urdu.
* ASCII-immune Unicode escape sequences (`\uXXXX`) ensure cross-platform compatibility across Windows, Linux, and containerized runtimes.

### Robust Fallbacks & Offline Resilience:
* In-memory SQLite fallback if PostgreSQL/pgvector is offline.
* Deterministic clinical heuristics fallback if local AMD vLLM is offline during development or CI.

---

## 🏗️ System Architecture

```text
       [ Patient / Clinician UI ] (Next.js 15)
                   │
                   ▼  (Encrypted Localhost / Private Subnet)
       [ FastAPI Gateway (Port 8001) ]
                   │
     ┌─────────────┴─────────────┐
     ▼                           ▼
[ Deterministic Triage ]   [ PHI Redactor Node ]
 (Tier 1 / 2 / 3 Guard)    (CNIC, Phone, Name Masking)
     │                           │
     └─────────────┬─────────────┘
                   ▼
       [ LangGraph Multi-Agent Core ]
        ├── OCR & Entity Parser Node
        ├── Pharmacological Bounds Check
        └── Bilingual Explainer (Urdu / Roman / EN)
                   │
                   ▼
       [ Local vLLM Inference Engine ]
          (AMD ROCm 6.x Acceleration)