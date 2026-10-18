from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.clinical import Medication
from app.schemas.clinical import (
    DailyScheduleResponse,
    TimelineSlot,
    MedicationResponse,
    MedicationToggleRequest,
)

router = APIRouter()


@router.get("/timeline", response_model=DailyScheduleResponse)
async def get_daily_schedule(
    patient_id: str = "PAT-9082",
    db: AsyncSession = Depends(get_db),
):
    """
    Returns patient's daily medication schedule grouped into Morning, Afternoon, Evening, and Bedtime slots
    along with real-time adherence calculation.
    """
    res = await db.execute(
        select(Medication).where(
            Medication.patient_id == patient_id,
            Medication.status == "active"
        )
    )
    meds = res.scalars().all()

    morning_items: List[MedicationResponse] = []
    afternoon_items: List[MedicationResponse] = []
    evening_items: List[MedicationResponse] = []
    bedtime_items: List[MedicationResponse] = []

    total_scheduled_instances = 0
    total_taken_instances = 0

    for m in meds:
        resp = MedicationResponse.model_validate(m)
        slots_str = (m.timing_slots or "").lower()

        is_morning = "morning" in slots_str or "subha" in slots_str
        is_afternoon = "afternoon" in slots_str or "noon" in slots_str or "dopahar" in slots_str
        is_evening = "evening" in slots_str or "shaam" in slots_str
        is_bedtime = "bedtime" in slots_str or "night" in slots_str or "hs" in slots_str

        # Default fallback if slots not specified
        if not (is_morning or is_afternoon or is_evening or is_bedtime):
            is_morning = True

        if is_morning:
            morning_items.append(resp)
            total_scheduled_instances += 1
            if m.taken_today:
                total_taken_instances += 1

        if is_afternoon:
            afternoon_items.append(resp)
            total_scheduled_instances += 1
            if m.taken_today:
                total_taken_instances += 1

        if is_evening:
            evening_items.append(resp)
            total_scheduled_instances += 1
            if m.taken_today:
                total_taken_instances += 1

        if is_bedtime:
            bedtime_items.append(resp)
            total_scheduled_instances += 1
            if m.taken_today:
                total_taken_instances += 1

    adherence_rate = (
        round((total_taken_instances / total_scheduled_instances) * 100, 1)
        if total_scheduled_instances > 0
        else 100.0
    )

    slots = [
        TimelineSlot(
            slot_id="morning",
            slot_name="Morning (Subha)",
            time_label="08:00 AM",
            items=morning_items,
        ),
        TimelineSlot(
            slot_id="afternoon",
            slot_name="Afternoon (Dopahar)",
            time_label="01:00 PM",
            items=afternoon_items,
        ),
        TimelineSlot(
            slot_id="evening",
            slot_name="Evening (Shaam)",
            time_label="06:00 PM",
            items=evening_items,
        ),
        TimelineSlot(
            slot_id="bedtime",
            slot_name="Bedtime (Raat)",
            time_label="10:00 PM",
            items=bedtime_items,
        ),
    ]

    return DailyScheduleResponse(
        date=date.today().strftime("%Y-%m-%d"),
        total_scheduled=total_scheduled_instances,
        total_taken=total_taken_instances,
        adherence_rate=adherence_rate,
        slots=slots,
    )


@router.post("/timeline/toggle")
async def toggle_medication_status(
    req: MedicationToggleRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Toggles the taken/pending status of a medication for today.
    """
    res = await db.execute(select(Medication).where(Medication.id == req.medication_id))
    med = res.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    med.taken_today = req.taken
    await db.commit()
    await db.refresh(med)

    return {
        "success": True,
        "medication_id": med.id,
        "taken_today": med.taken_today,
        "name": med.name,
    }
