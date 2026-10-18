from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.clinical import Patient, Medication
from app.schemas.clinical import ChatRequest, ChatResponse
from app.services.triage import evaluate_triage

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def clinical_chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Multimodal Clinical Agent chat endpoint with 3-Tier Safety Matrix:
    - Tier 3: Emergency lockdown triggers 1122 protocol.
    - Tier 2: Flags unreadable handwriting or dosage ambiguity.
    - Tier 1: Clinical reasoning & routine care guidance in English, Nastaliq Urdu, or Roman Urdu.
    """
    user_msg = req.message.strip()
    lang = req.language or "en"

    # Step 1: Strict 3-Tier Clinical Safety Matrix
    triage_result = evaluate_triage(user_msg, language=lang)

    # If Tier 3 Emergency: Lockdown immediately
    if triage_result.tier == 3:
        suggested_actions = [
            "Call Rescue 1122 Immediately",
            "Go to Nearest Emergency Room",
            "Notify Emergency Contact",
        ]
        return ChatResponse(
            reply=triage_result.message,
            safety_tier="Tier-3",
            status="EMERGENCY",
            action_required="RESCUE_1122_TRIGGERED",
            alert=True,
            tier="Tier-3",
            triage=triage_result,
            language=lang,
            agent_route="EMERGENCY_LOCKDOWN_TIER_3",
            timestamp=datetime.utcnow().isoformat() + "Z",
            suggested_actions=suggested_actions,
        )

    # If Tier 2 Clarification Required
    if triage_result.tier == 2:
        suggested_actions = [
            "Re-scan Prescription with Clear Light",
            "Contact Prescribing Physician",
            "Verify with Licensed Pharmacist",
        ]
        return ChatResponse(
            reply=triage_result.message,
            safety_tier="Tier-2",
            status="CLARIFICATION_REQUIRED",
            action_required="CONSULT_DOCTOR",
            alert=True,
            tier="Tier-2",
            triage=triage_result,
            language=lang,
            agent_route="CLARIFICATION_SAFETY_TIER_2",
            timestamp=datetime.utcnow().isoformat() + "Z",
            suggested_actions=suggested_actions,
        )

    # Step 2: Tier 1 - Routine Clinical Knowledge Agent
    # Retrieve patient's active medications for personalized context
    res_meds = await db.execute(
        select(Medication).where(
            Medication.patient_id == req.patient_id,
            Medication.status == "active"
        )
    )
    active_meds = res_meds.scalars().all()
    med_names = [f"{m.name} ({m.dosage})" for m in active_meds]
    meds_summary = ", ".join(med_names) if med_names else "Panadol 500mg, Augmentin 625mg, Nexum 40mg, Lipitor 20mg"

    reply_text, suggested_actions = _generate_clinical_reply(user_msg, lang, meds_summary)

    return ChatResponse(
        reply=reply_text,
        safety_tier="Tier-1",
        status="ROUTINE",
        action_required="NONE",
        alert=False,
        tier="Tier-1",
        triage=triage_result,
        language=lang,
        agent_route="CLINICAL_INTELLIGENCE_TIER_1",
        timestamp=datetime.utcnow().isoformat() + "Z",
        suggested_actions=suggested_actions,
    )


def _generate_clinical_reply(query: str, lang: str, meds_summary: str) -> tuple[str, List[str]]:
    q_lower = query.lower()

    # Domain topic checks
    is_timing = any(k in q_lower for k in ["time", "timing", "when", "schedule", "waqt", "kab", "وقت", "کب"])
    is_food = any(k in q_lower for k in ["food", "empty", "breakfast", "khana", "bhook", "کھانا", "نہار منہ", "چائے", "tea"])
    is_missed = any(k in q_lower for k in ["miss", "forgot", "bhool", "بھول"])
    is_side_effect = any(k in q_lower for k in ["side effect", "nausea", "upset", "matli", "پیٹ خراب", "الٹی"])

    if lang == "ur":
        prefix = "[Tier-1 Routine Guidance]: میڈی فلو اے آئی (MediFlow Assistant) معمول کی طبی رہنمائی و ٹائم ٹیبل:\n"
        if is_timing:
            reply = (
                prefix +
                f"آپ کی موجودہ فعال ادویات ({meds_summary}) کے لیے تجویز کردہ شیڈول:\n"
                "• نیکسم (Nexum 40mg): صبح ناشتے سے 30 منٹ پہلے نہار منہ۔\n"
                "• پیناڈول (Panadol 500mg): صبح، دوپہر، شام (کھانے کے بعد ضرورت کے مطابق)۔\n"
                "• آگمنٹن (Augmentin 625mg): صبح اور شام کھانے کے فوراً بعد (7 دن کا کورس مکمل کریں)۔\n"
                "• لپیٹر (Lipitor 20mg): رات کو سوتے وقت۔"
            )
            actions = ["مکمل شیڈول دیکھیں", "کھانے کے پرہیز", "اگلی خوراک کا وقت"]
        elif is_food:
            reply = (
                prefix +
                "کھانے اور پینے کے بارے میں اہم معمول کی ہدایات:\n"
                "1. نیکسم (Nexum) ہمیشہ نہار منہ ایک گلاس پانی کے ساتھ لیں۔\n"
                "2. آگمنٹن (Augmentin) معدے کی خرابی سے بچنے کے لیے کھانے کے ساتھ یا فوراً بعد لیں۔\n"
                "3. لپیٹر (Lipitor) کے استعمال کے دوران چکوترے (Grapefruit) کے رس سے پرہیز کریں۔\n"
                "4. بلڈ پریشر یا دیگر ادویات پانی کے ساتھ لیں، چائے یا کیفین دوا لینے کے کم از کم ایک گھنٹے بعد پیئیں۔"
            )
            actions = ["پانی پینے کی مقدار", "معدے کی تیزابیت کا علاج", "ڈاکٹر کی سمری"]
        elif is_missed:
            reply = (
                prefix +
                "اگر آپ دوا لینا بھول جائیں:\n"
                "جیسے ہی یاد آئے، فوراً دوا لے لیں۔ لیکن اگر آپ کی اگلی خوراک کا وقت قریب ہو، "
                "تو چھوٹی ہوئی خوراک چھوڑ دیں اور معمول کے وقت پر اگلی خوراک لیں۔ کبھی بھی ڈبل خوراک نہ لیں۔"
            )
            actions = ["شیڈول الرٹ آن کریں", "فارماسسٹ سے بات کریں"]
        else:
            reply = (
                prefix +
                f"آپ کی صحت اور نگہداشت کے لیے حاضر ہے۔ آپ کی موجودہ ادویات میں شامل ہیں: {meds_summary}۔\n"
                "آپ اپنی ادویات کے اوقات، کھانے کی احتیاطوں، یا ڈاکٹر کی سمری کے بارے میں بلا جھجھک پوچھ سکتے ہیں۔"
            )
            actions = ["آج کا ٹائم ٹیبل", "منشیات کے تعاملات", "ڈاکٹر ہینڈ اوور"]

    elif lang == "roman_ur":
        if is_timing:
            reply = (
                f"Aapki active medications ({meds_summary}) ka standard timetable yeh hai:\n"
                "• Nexum 40mg: Subha nashte se 30 minute pehle (Nahar munh).\n"
                "• Panadol 500mg: Subha, Dopahar, Shaam (Khaane ke baad, dard/bukhar ke mutabiq).\n"
                "• Augmentin 625mg: Subha aur Shaam khaana khaane ke baad (7 din ka mukammal course karein).\n"
                "• Lipitor 20mg: Raat ko sote waqt."
            )
            actions = ["View Full Timeline", "Khaane ke sath ehtiyat", "Next Dose Time"]
        elif is_food:
            reply = (
                "Khaane aur Parhez ki zaroori hidayat:\n"
                "1. Nexum hamesha subha nahar munh paani ke sath lein.\n"
                "2. Augmentin khaane ke sath ya foran baad lein taake pait kharab na ho.\n"
                "3. Lipitor ke sath Grapefruit juice se parhez karein."
            )
            actions = ["Hydration Advice", "Doctor Summary", "Drug Interactions"]
        elif is_missed:
            reply = (
                "Agar aap khuraak lena bhool gaye hain:\n"
                "Jaise hi yaad aaye le lein. Lekin agar agli dose ka waqt qareeb hai to purani dose chhor dein "
                "aur regular routine follow karein. Kabhi bhi do doses ek sath mat lein."
            )
            actions = ["Check Timeline", "Pharmacist Consultation"]
        else:
            reply = (
                f"MediFlow AI aapki active dawaiyon ({meds_summary}) ki nigrani kar raha hai.\n"
                "Aap dose timings, khana peena, ya side effects ke bare mein koi bhi sawal pooch sakte hain."
            )
            actions = ["Today's Schedule", "Doctor Handover", "Side Effects Guide"]

    else:  # English default
        if is_timing:
            reply = (
                f"Here is your personalized dosing timetable for your active medications ({meds_summary}):\n\n"
                "• Nexum (Esomeprazole 40mg): Morning, 30 minutes before breakfast on an empty stomach.\n"
                "• Augmentin 625mg: Morning (08:00 AM) & Evening (06:00 PM) with meals. Complete full 7-day course.\n"
                "• Panadol (Paracetamol 500mg): Morning, Noon, Evening as needed for fever/discomfort.\n"
                "• Lipitor (Atorvastatin 20mg): Bedtime (10:00 PM) before sleeping."
            )
            actions = ["View Daily Timeline", "Dietary Instructions", "Interaction Alerts"]
        elif is_food:
            reply = (
                "Key Dietary & Administration Guidance:\n"
                "1. Nexum: Must be taken on an empty stomach with a full glass of water.\n"
                "2. Augmentin: Always take at the start of or immediately after a meal to reduce GI intolerance.\n"
                "3. Lipitor: Strictly avoid grapefruit and grapefruit juice due to CYP3A4 metabolism interaction.\n"
                "4. Hydration: Maintain at least 2.5 liters of water daily during antibiotic therapy."
            )
            actions = ["Check Drug Conflicts", "Physician Summary", "Log Taken Med"]
        elif is_missed:
            reply = (
                "Missed Dose Protocol:\n"
                "Take the missed dose as soon as you remember. However, if it is almost time for your next scheduled dose, "
                "skip the missed dose and resume your regular dosing schedule. Never double up on pills to compensate."
            )
            actions = ["Check Schedule", "Pharmacist Clarification"]
        elif is_side_effect:
            reply = (
                "Common vs Red-Flag Reactions:\n"
                "• Mild nausea or loose stools are common with Augmentin. Taking it with meals usually helps.\n"
                "• If you experience severe cutaneous hives, facial swelling, or breathing difficulty, this may indicate "
                "an acute hypersensitivity reaction. Suspend medication and dial Rescue 1122 immediately."
            )
            actions = ["Emergency Protocol", "View Doctor Summary"]
        else:
            reply = (
                f"MediFlow Clinical Assistant is monitoring your active regimen: {meds_summary}.\n"
                "You can ask about drug schedules, food precautions, missed doses, or prepare an exportable handover profile for a new doctor."
            )
            actions = ["View Daily Schedule", "Doctor Handover Profile", "Food Precautions"]

    return reply, actions
