from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.clinical import DoctorHandoverProfile
from app.services.history_aggregator import generate_doctor_handover_profile

router = APIRouter()


@router.get("/patient/summary", response_model=DoctorHandoverProfile)
async def get_patient_handover_summary(
    patient_id: str = Query("PAT-9082", description="Patient unique identifier"),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates a structured Physician Clinical Handover Profile for cross-doctor continuity.
    Displays chief complaints timeline, treatment failures, active prescription overlaps,
    known drug allergies, and actionable recommendations.
    """
    return await generate_doctor_handover_profile(db=db, patient_id=patient_id)


@router.post("/patient/summary", response_model=DoctorHandoverProfile)
async def create_or_refresh_patient_handover_summary(
    patient_id: str = Query("PAT-9082", description="Patient unique identifier"),
    db: AsyncSession = Depends(get_db),
):
    """
    Refreshes and returns the longitudinal physician handover profile.
    """
    return await generate_doctor_handover_profile(db=db, patient_id=patient_id)
