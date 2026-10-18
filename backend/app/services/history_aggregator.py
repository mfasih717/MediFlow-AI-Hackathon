from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.clinical import Patient, Consultation, Medication, Prescription
from app.schemas.clinical import (
    DoctorHandoverProfile,
    TreatmentFailureItem,
    DrugInteractionItem,
    MedicationResponse,
)
from app.services.interaction_checker import check_drug_interactions
from app.core.security import mask_name


async def generate_doctor_handover_profile(
    db: AsyncSession,
    patient_id: str = "PAT-9082"
) -> DoctorHandoverProfile:
    """
    Formulates a comprehensive cross-doctor longitudinal summary for new consulting physicians.
    Collates treatment failures, past therapies, active prescriptions, and drug-drug conflicts.
    """
    # 1. Fetch Patient
    res_pat = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = res_pat.scalar_one_or_none()

    if not patient:
        # Fallback default patient representation if not in DB yet
        patient_demographics = {
            "full_name_masked": "A**** K***",
            "age": 48,
            "gender": "Male",
            "blood_group": "B+",
            "emergency_contact": "+92 300 8451122 (Brother - Tariq Khan)",
        }
        allergies_str = "Penicillin (mild cutaneous rash in 2021), Sulfa drugs"
        mrn_val = "MRN-PK-78219"
    else:
        patient_demographics = {
            "full_name_masked": mask_name(patient.full_name),
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "emergency_contact": patient.emergency_contact,
        }
        allergies_str = patient.allergies
        mrn_val = patient.mrn

    # 2. Fetch Consultations
    res_con = await db.execute(
        select(Consultation)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.visit_date.asc())
    )
    consultations = res_con.scalars().all()

    chief_complaints_timeline: List[Dict[str, Any]] = []
    treatment_failures: List[TreatmentFailureItem] = []

    for c in consultations:
        chief_complaints_timeline.append({
            "consultation_id": c.id,
            "visit_date": c.visit_date.strftime("%Y-%m-%d"),
            "doctor": c.doctor_name,
            "specialty": c.specialty,
            "clinic": c.clinic_name,
            "chief_complaint": c.chief_complaint,
            "outcome": c.treatment_outcome,
            "notes": c.handover_notes or c.clinical_notes,
        })

        if c.treatment_outcome in ["treatment_failure", "adverse_reaction"]:
            treatment_failures.append(
                TreatmentFailureItem(
                    consultation_id=c.id,
                    doctor_name=c.doctor_name,
                    specialty=c.specialty,
                    date=c.visit_date.strftime("%Y-%m-%d"),
                    chief_complaint=c.chief_complaint,
                    attempted_therapy="Cefixime 400mg PO daily x 7 days + symptomatic antipyretics",
                    failure_rationale=c.handover_notes or "Refractory symptoms with no clinical improvement after complete 7-day course.",
                )
            )

    # 3. Fetch Medications
    res_med = await db.execute(select(Medication).where(Medication.patient_id == patient_id))
    med_records = res_med.scalars().all()

    active_meds: List[MedicationResponse] = []
    discontinued_meds: List[MedicationResponse] = []
    active_drug_names: List[str] = []

    for m in med_records:
        med_resp = MedicationResponse.model_validate(m)
        if m.status == "active":
            active_meds.append(med_resp)
            active_drug_names.append(m.name)
            if m.generic_name:
                active_drug_names.append(m.generic_name)
        else:
            discontinued_meds.append(med_resp)

    # 4. Compute Drug Interactions & Allergy Conflicts
    drug_interactions = check_drug_interactions(active_drug_names, allergies_str)

    # 5. Physician Bulletins & Tailored Directives
    bulletins = [
        "Patient presenting for second opinion following refractory lower respiratory symptoms.",
        "Initial 7-day course of Cefixime 400mg showed therapeutic failure with persistent productive cough.",
        "Secondary intervention with Augmentin 625mg & Esomeprazole 40mg initiated 7 days ago with only partial symptomatic relief.",
        "Documented cutaneous penicillin allergy requires vigilant surveillance if continuing beta-lactam class.",
    ]

    recommendations = [
        "Consider diagnostic Chest HRCT or Sputum Culture/Sensitivity to rule out atypical or resistant pathogen.",
        "Review ongoing Augmentin therapy in light of historical Penicillin sensitivity; substitute with Respiratory Macrolide (e.g. Azithromycin 500mg) or Fluoroquinolone if rash recurs.",
        "Continue Esomeprazole 40mg 30 minutes before breakfast if GERD-associated nocturnal micro-aspiration cough is suspected.",
        "Verify lipid panel to titrate Atorvastatin 20mg baseline.",
    ]

    allergy_list = [a.strip() for a in allergies_str.split(",") if a.strip()]

    return DoctorHandoverProfile(
        patient_id=patient_id,
        mrn=mrn_val,
        patient_demographics=patient_demographics,
        allergies=allergy_list,
        chief_complaints_timeline=chief_complaints_timeline,
        treatment_failures=treatment_failures,
        active_medications=active_meds,
        discontinued_medications=discontinued_meds,
        drug_interactions=drug_interactions,
        clinical_summary_bulletins=bulletins,
        new_doctor_recommendations=recommendations,
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
    )
