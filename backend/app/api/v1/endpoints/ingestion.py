import uuid
from datetime import datetime, date
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.clinical import Patient, Prescription, Medication
from app.schemas.clinical import (
    PrescriptionUploadResponse,
    PrescriptionResponse,
    MedicationResponse,
)
from app.services.ocr_engine import extract_prescription_data
from app.services.triage import evaluate_triage
from app.services.interaction_checker import check_drug_interactions

router = APIRouter()


@router.post("/upload", response_model=PrescriptionUploadResponse)
async def upload_prescription(
    file: UploadFile = File(...),
    patient_id: str = Form("PAT-9082"),
    db: AsyncSession = Depends(get_db),
):
    """
    Ingests prescription scan (PDF or Image), performs Multimodal OCR extraction,
    normalizes dosage frequencies, runs the 3-Tier Safety Matrix, and audits drug interactions.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read uploaded file bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # 1. OCR Extraction (Multimodal / Clinical Fallback)
    parsed = await extract_prescription_data(file_bytes, file.filename)

    # 2. Check or create patient
    res_pat = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = res_pat.scalar_one_or_none()
    if not patient:
        patient = Patient(
            id=patient_id,
            mrn=f"MRN-PK-{uuid.uuid4().hex[:5].upper()}",
            full_name="Ahmed Khan",
            age=48,
            gender="Male",
            blood_group="B+",
            allergies="Penicillin, Sulfa drugs",
            emergency_contact="+92 300 8451122",
        )
        db.add(patient)
        await db.flush()

    # 3. Create Prescription Record
    rx_id = f"RX-{uuid.uuid4().hex[:6].upper()}"
    prescription = Prescription(
        id=rx_id,
        patient_id=patient.id,
        doctor_name=parsed.get("doctor_name", "Dr. Ayesha Siddiqa"),
        hospital_clinic=parsed.get("hospital_clinic", "Outpatient Clinic"),
        date_prescribed=parsed.get("date_prescribed", date.today()),
        raw_ocr_text=parsed.get("raw_ocr_text", ""),
        diagnostic_intent=parsed.get("diagnostic_intent", "Acute Clinical Review"),
        created_at=datetime.utcnow(),
    )
    db.add(prescription)
    await db.flush()

    # 4. Save extracted medications
    created_meds: list[Medication] = []
    med_names_for_interaction: list[str] = []

    for med_data in parsed.get("medications", []):
        med_id = f"MED-{uuid.uuid4().hex[:6].upper()}"
        med_obj = Medication(
            id=med_id,
            prescription_id=prescription.id,
            patient_id=patient.id,
            name=med_data["name"],
            generic_name=med_data.get("generic_name", ""),
            dosage=med_data["dosage"],
            frequency=med_data["frequency"],
            route=med_data.get("route", "Oral"),
            duration=med_data.get("duration", "7 days"),
            instructions=med_data.get("instructions", "Take as directed"),
            timing_slots=med_data.get("timing_slots", "Morning, Evening"),
            status=med_data.get("status", "active"),
            side_effects_noted=med_data.get("side_effects_noted"),
            taken_today=False,
        )
        db.add(med_obj)
        created_meds.append(med_obj)
        med_names_for_interaction.append(med_data["name"])
        if med_data.get("generic_name"):
            med_names_for_interaction.append(med_data["generic_name"])

    await db.commit()
    await db.refresh(prescription)

    # 5. Run 3-Tier Safety Matrix on OCR Text
    triage_result = evaluate_triage(parsed.get("raw_ocr_text", ""), language="en")

    # 6. Check for drug-drug interactions with newly added meds and patient allergy history
    interactions = check_drug_interactions(med_names_for_interaction, patient.allergies)

    # Format response
    med_responses = [MedicationResponse.model_validate(m) for m in created_meds]
    rx_response = PrescriptionResponse(
        id=prescription.id,
        patient_id=prescription.patient_id,
        doctor_name=prescription.doctor_name,
        hospital_clinic=prescription.hospital_clinic,
        date_prescribed=prescription.date_prescribed,
        diagnostic_intent=prescription.diagnostic_intent,
        raw_ocr_text=prescription.raw_ocr_text,
        medications=med_responses,
        created_at=prescription.created_at,
    )

    return PrescriptionUploadResponse(
        success=True,
        prescription=rx_response,
        extracted_count=len(created_meds),
        triage=triage_result,
        potential_interactions=[item.model_dump() for item in interactions],
        doctor_instructions=parsed.get(
            "precaution_notes",
            "Adhere strictly to prescribed dosing timetable. Complete full antibacterial duration."
        ),
    )
