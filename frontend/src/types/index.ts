export type Language = "en" | "ur" | "roman_ur";

export type TriageTier = 1 | 2 | 3;

export type TriageStatus = "ROUTINE_SAFE" | "CLARIFICATION_REQUIRED" | "EMERGENCY";

export interface TriageResult {
  tier: TriageTier;
  status: TriageStatus;
  emergency_lockdown: boolean;
  action: string;
  message: string;
  dialer_number?: string | null;
  detected_red_flags: string[];
}

export interface Medication {
  id: string;
  patient_id: string;
  prescription_id?: string | null;
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions: string;
  timing_slots: string;
  status: "active" | "discontinued" | "completed";
  side_effects_noted?: string | null;
  taken_today: boolean;
  updated_at?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_name: string;
  hospital_clinic: string;
  date_prescribed: string;
  diagnostic_intent: string;
  raw_ocr_text: string;
  medications: Medication[];
  created_at: string;
}

export interface DrugInteraction {
  drug_a: string;
  drug_b: string;
  severity: "HIGH" | "MODERATE" | "LOW";
  mechanism: string;
  action_required: string;
}

export interface TreatmentFailure {
  consultation_id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  chief_complaint: string;
  attempted_therapy: string;
  failure_rationale: string;
}

export interface DoctorHandoverProfile {
  patient_id: string;
  mrn: string;
  patient_demographics: {
    full_name_masked: string;
    age: number;
    gender: string;
    blood_group: string;
    emergency_contact: string;
  };
  allergies: string[];
  chief_complaints_timeline: Array<{
    consultation_id: string;
    visit_date: string;
    doctor: string;
    specialty: string;
    clinic: string;
    chief_complaint: string;
    outcome: string;
    notes: string;
  }>;
  treatment_failures: TreatmentFailure[];
  active_medications: Medication[];
  discontinued_medications: Medication[];
  drug_interactions: DrugInteraction[];
  clinical_summary_bulletins: string[];
  new_doctor_recommendations: string[];
  generated_at: string;
}

export interface TimelineSlot {
  slot_id: string;
  slot_name: string;
  time_label: string;
  items: Medication[];
}

export interface DailySchedule {
  date: string;
  total_scheduled: number;
  total_taken: number;
  adherence_rate: number;
  slots: TimelineSlot[];
}

export interface PrescriptionUploadResponse {
  success: boolean;
  prescription: Prescription;
  extracted_count: number;
  triage: TriageResult;
  potential_interactions: DrugInteraction[];
  doctor_instructions: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  triage?: TriageResult;
  suggested_actions?: string[];
  agent_route?: string;
}

export interface HealthStatus {
  status: string;
  project: string;
  version: string;
  timestamp: string;
  rocm_telemetry: {
    rocm_available: boolean;
    driver_version: string;
    device_name: string;
    compute_partition: string;
    vram_allocated_mb: number;
    vram_total_mb: number;
    gpu_temperature_c: number;
    status: string;
  };
  vllm_service: {
    base_url: string;
    model_name: string;
    status: string;
    fallback_active: boolean;
  };
  database: {
    engine: string;
    status: string;
  };
}
