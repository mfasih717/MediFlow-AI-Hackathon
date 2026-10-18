from datetime import datetime, date
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------------
# Triage Schemas (3-Tier Clinical Safety Matrix)
# ---------------------------------------------------------------------------

class TriageResult(BaseModel):
    tier: Literal[1, 2, 3] = Field(description="1: Routine, 2: Clarification/Ambiguity, 3: Emergency Lockdown")
    status: Literal["ROUTINE_SAFE", "CLARIFICATION_REQUIRED", "EMERGENCY"]
    emergency_lockdown: bool = False
    action: str = Field(description="Direct clinical or emergency action recommended")
    message: str
    dialer_number: Optional[str] = None
    detected_red_flags: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Medication Schemas
# ---------------------------------------------------------------------------

class MedicationBase(BaseModel):
    name: str
    generic_name: Optional[str] = ""
    dosage: str
    frequency: str
    route: str = "Oral"
    duration: str = "7 days"
    instructions: str = "Take as directed"
    timing_slots: str = "Morning, Evening"
    status: str = "active"
    side_effects_noted: Optional[str] = None
    taken_today: bool = False


class MedicationCreate(MedicationBase):
    patient_id: str
    prescription_id: Optional[str] = None


class MedicationResponse(MedicationBase):
    id: str
    patient_id: str
    prescription_id: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MedicationToggleRequest(BaseModel):
    medication_id: str
    taken: bool


# ---------------------------------------------------------------------------
# Prescription Schemas
# ---------------------------------------------------------------------------

class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    doctor_name: str
    hospital_clinic: str
    date_prescribed: date
    diagnostic_intent: str
    raw_ocr_text: str
    medications: List[MedicationResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrescriptionUploadResponse(BaseModel):
    success: bool
    prescription: PrescriptionResponse
    extracted_count: int
    triage: TriageResult
    potential_interactions: List[Dict[str, Any]] = Field(default_factory=list)
    doctor_instructions: str


# ---------------------------------------------------------------------------
# Consultation Schemas
# ---------------------------------------------------------------------------

class ConsultationResponse(BaseModel):
    id: str
    patient_id: str
    doctor_name: str
    specialty: str
    clinic_name: str
    visit_date: date
    chief_complaint: str
    clinical_notes: str
    treatment_outcome: str  # resolved, partially_resolved, treatment_failure, adverse_reaction
    handover_notes: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Patient Schemas
# ---------------------------------------------------------------------------

class PatientResponse(BaseModel):
    id: str
    mrn: str
    full_name_masked: str
    age: int
    gender: str
    blood_group: str
    allergies: str
    emergency_contact: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Physician Handover Summary Schemas (Cross-Doctor Continuity)
# ---------------------------------------------------------------------------

class DrugInteractionItem(BaseModel):
    drug_a: str
    drug_b: str
    severity: Literal["HIGH", "MODERATE", "LOW"]
    mechanism: str
    action_required: str


class TreatmentFailureItem(BaseModel):
    consultation_id: str
    doctor_name: str
    specialty: str
    date: str
    chief_complaint: str
    attempted_therapy: str
    failure_rationale: str


class DoctorHandoverProfile(BaseModel):
    patient_id: str
    mrn: str
    patient_demographics: Dict[str, Any]
    allergies: List[str]
    chief_complaints_timeline: List[Dict[str, Any]]
    treatment_failures: List[TreatmentFailureItem]
    active_medications: List[MedicationResponse]
    discontinued_medications: List[MedicationResponse]
    drug_interactions: List[DrugInteractionItem]
    clinical_summary_bulletins: List[str]
    new_doctor_recommendations: List[str]
    generated_at: str


# ---------------------------------------------------------------------------
# Daily Schedule & Timeline Schemas
# ---------------------------------------------------------------------------

class TimelineSlot(BaseModel):
    slot_id: str  # morning, afternoon, evening, bedtime
    slot_name: str
    time_label: str
    items: List[MedicationResponse]


class DailyScheduleResponse(BaseModel):
    date: str
    total_scheduled: int
    total_taken: int
    adherence_rate: float
    slots: List[TimelineSlot]


# ---------------------------------------------------------------------------
# Chat & Multimodal Assistant Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    patient_id: Optional[str] = "PAT-9082"
    language: Literal["en", "ur", "roman_ur"] = "en"


class ChatResponse(BaseModel):
    reply: str
    safety_tier: str = Field(description="Tier-1, Tier-2, or Tier-3")
    status: str = Field(description="EMERGENCY, CLARIFICATION_REQUIRED, or ROUTINE")
    action_required: str = Field(description="RESCUE_1122_TRIGGERED, CONSULT_DOCTOR, or NONE")
    alert: bool = Field(default=False, description="Emergency or clinical safety alert triggered")
    tier: str = Field(default="Tier-1", description="Tier-1, Tier-2, or Tier-3")
    triage: TriageResult
    language: str = "en"
    agent_route: str = "CLINICAL_INTELLIGENCE_TIER_1"
    timestamp: str = ""
    suggested_actions: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# System Health & Telemetry Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    timestamp: str
    rocm_telemetry: Dict[str, Any]
    vllm_service: Dict[str, Any]
    database: Dict[str, Any]
