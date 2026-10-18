import logging
from datetime import datetime, date, timedelta
from app.db.database import engine, Base, AsyncSessionLocal
from app.models.clinical import Patient, Prescription, Medication, Consultation, InteractionWarning

logger = logging.getLogger("mediflow.db")


async def init_db() -> None:
    """
    Initializes database tables and seeds demo clinical records if empty.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed baseline patient and consultation history for Hackathon demonstration
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(Patient).limit(1))
        existing_patient = result.scalar_one_or_none()

        if not existing_patient:
            demo_patient = Patient(
                id="PAT-9082",
                mrn="MRN-PK-78219",
                full_name="Ahmed Khan",
                age=48,
                gender="Male",
                blood_group="B+",
                allergies="Penicillin (mild cutaneous rash in 2021), Sulfa drugs",
                emergency_contact="+92 300 8451122 (Brother - Tariq Khan)",
                created_at=datetime.utcnow() - timedelta(days=45),
            )
            session.add(demo_patient)
            await session.flush()

            # Past Consultation 1: GP Visit (Initial visit for persistent fever & cough)
            consult_1 = Consultation(
                id="CON-101",
                patient_id=demo_patient.id,
                doctor_name="Dr. Tariq Mahmood",
                specialty="General Medicine",
                clinic_name="Shifa Polyclinic, Lahore",
                visit_date=date.today() - timedelta(days=21),
                chief_complaint="Productive cough with yellow sputum and low-grade evening fever for 5 days.",
                clinical_notes="Chest examination showed bilateral rhonchi. Prescribed Cefixime 400mg and Paracetamol. Advised steam inhalation.",
                treatment_outcome="treatment_failure",
                handover_notes="Patient experienced persistent cough and gastric burning. Cefixime showed inadequate resolution after full 7-day course.",
            )

            # Past Consultation 2: Pulmonologist Visit (Follow-up after initial failure)
            consult_2 = Consultation(
                id="CON-102",
                patient_id=demo_patient.id,
                doctor_name="Dr. Ayesha Siddiqa",
                specialty="Pulmonology",
                clinic_name="National Hospital & Medical Centre",
                visit_date=date.today() - timedelta(days=7),
                chief_complaint="Persistent productive cough, nocturnal dyspnea, and mild retrosternal acid reflux.",
                clinical_notes="Suspected atypical respiratory infection with secondary acid-reflux-induced cough. Discontinued Cefixime.",
                treatment_outcome="partially_resolved",
                handover_notes="Started on Augmentin 625mg and Esomeprazole. Patient noted mild epigastric discomfort.",
            )

            session.add_all([consult_1, consult_2])

            # Prescriptions
            rx_1 = Prescription(
                id="RX-501",
                patient_id=demo_patient.id,
                doctor_name="Dr. Ayesha Siddiqa",
                hospital_clinic="National Hospital & Medical Centre",
                date_prescribed=date.today() - timedelta(days=7),
                raw_ocr_text="Rx: Augmentin 625mg 1 tab BD x 7d\nNexum 40mg 1 cap OD AC x 14d\nPanadol 500mg 1 tab TDS PRN fever\nLipitor 20mg 1 tab HS x 30d",
                diagnostic_intent="Acute Lower Respiratory Tract Infection & Dyslipidemia Management",
                created_at=datetime.utcnow() - timedelta(days=7),
            )
            session.add(rx_1)
            await session.flush()

            # Active & Past Medications
            meds = [
                Medication(
                    id="MED-1",
                    prescription_id=rx_1.id,
                    patient_id=demo_patient.id,
                    name="Panadol",
                    generic_name="Paracetamol",
                    dosage="500mg",
                    frequency="1 tablet three times daily (TDS)",
                    route="Oral",
                    duration="5 days",
                    instructions="Take after meals with plenty of water. Do not exceed 8 tablets in 24 hours.",
                    timing_slots="Morning, Afternoon, Evening",
                    status="active",
                    side_effects_noted=None,
                ),
                Medication(
                    id="MED-2",
                    prescription_id=rx_1.id,
                    patient_id=demo_patient.id,
                    name="Augmentin",
                    generic_name="Amoxicillin + Clavulanic Acid",
                    dosage="625mg",
                    frequency="1 tablet twice daily (BD)",
                    route="Oral",
                    duration="7 days",
                    instructions="Take at the start of a meal to reduce gastrointestinal intolerance.",
                    timing_slots="Morning, Evening",
                    status="active",
                    side_effects_noted="Mild nausea reported",
                ),
                Medication(
                    id="MED-3",
                    prescription_id=rx_1.id,
                    patient_id=demo_patient.id,
                    name="Nexum",
                    generic_name="Esomeprazole",
                    dosage="40mg",
                    frequency="1 capsule once daily (OD)",
                    route="Oral",
                    duration="14 days",
                    instructions="Take 30 minutes before breakfast on an empty stomach.",
                    timing_slots="Morning",
                    status="active",
                    side_effects_noted=None,
                ),
                Medication(
                    id="MED-4",
                    prescription_id=rx_1.id,
                    patient_id=demo_patient.id,
                    name="Lipitor",
                    generic_name="Atorvastatin",
                    dosage="20mg",
                    frequency="1 tablet at bedtime (HS)",
                    route="Oral",
                    duration="30 days",
                    instructions="Take before sleeping. Avoid grapefruit juice.",
                    timing_slots="Bedtime",
                    status="active",
                    side_effects_noted=None,
                ),
                Medication(
                    id="MED-0",
                    prescription_id=None,
                    patient_id=demo_patient.id,
                    name="Cefixime",
                    generic_name="Cefixime Trihydrate",
                    dosage="400mg",
                    frequency="1 capsule daily",
                    route="Oral",
                    duration="7 days",
                    instructions="Completed course; discontinued due to clinical inefficacy.",
                    timing_slots="Morning",
                    status="discontinued",
                    side_effects_noted="Lack of therapeutic response & epigastric burning",
                ),
            ]
            session.add_all(meds)

            # Interaction Warnings baseline
            warning_1 = InteractionWarning(
                id="INT-1",
                medication_a="Augmentin (Amoxicillin)",
                medication_b="Penicillin Allergy History",
                severity="HIGH",
                clinical_rationale="Cross-sensitivity risk: Patient has a recorded history of cutaneous reaction to Penicillin class.",
                recommendation="Monitor closely for hypersensitivity. If urticaria or pruritus develops, immediately switch to Macrolide alternative (e.g. Azithromycin).",
            )
            session.add(warning_1)

            await session.commit()
            logger.info("Database initialized and demo clinical records successfully seeded.")
