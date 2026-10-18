import re
from typing import List
from app.schemas.clinical import TriageResult

# ---------------------------------------------------------------------------
# Tier 3 (EMERGENCY) Triggers
# Word-boundary tolerant, case-insensitive, handling conversational noise,
# intervening punctuation, and appended metadata.
# ---------------------------------------------------------------------------
TIER_3_PATTERNS = [
    # Explicit Acute Red Flags
    r"chest[\s\W_]+pain",
    r"chest\s+(?:.*?\s+)?pain",
    r"\bseene\b",
    r"\bs[ei]+n[ei|a|y]*\b",
    r"سینے|سینہ",
    r"\bdard\b",
    r"درد",
    r"\bbreath\w*",
    r"\bs[aa]+ns\b",
    r"سانس",
    r"\bbleed\w*",
    r"\bblood\w*",
    r"\bkh[oo|u]+n\b",
    r"خون",
    r"\bunconscious\w*",
    r"\bbe[\s\W_]*hosh\w*",
    r"بے[\s\W_\u200c]*ہوش",
    r"\banaphylax\w*",
    r"\bcollaps\w*",

    # English - Chest & Cardiac & Shock
    r"crushing[\s\W_]+(?:chest|pain)",
    r"heart[\s\W_]+attack",
    r"myocardial",
    
    # English - Respiratory & Dyspnea
    r"shortness[\s\W_]+of[\s\W_]+breath",
    r"difficult(?:y)?[\s\W_]+(?:in[\s\W_]+)?breath(?:ing)?",
    r"breath(?:ing)?[\s\W_]+(?:.*?[\s\W_]+)?difficult(?:y)?",
    r"severe[\s\W_]+dyspnea",
    r"\bdyspnea\b",
    r"suffocat\w*",
    r"lips[\s\W_]+(?:turn\w*[\s\W_]+)?blue",
    r"throat[\s\W_]+clos\w*",
    
    # English - Bleeding & Hemorrhage
    r"heavy[\s\W_]+bleeding",
    r"bleed(?:ing)?[\s\W_]+(?:.*?[\s\W_]+)?(?:heavily|severely|profusely)",
    r"cough(?:ing)?[\s\W_]+(?:.*?[\s\W_]+)?blood",
    r"vomit(?:ing)?[\s\W_]+(?:.*?[\s\W_]+)?blood",
    r"hemoptysis",
    r"hemorrhage",
    
    # English - Consciousness & Neurological & Shock
    r"loss[\s\W_]+of[\s\W_]+consciousness",
    r"severe[\s\W_]+allergic[\s\W_]+reaction",
    r"\bstroke\b",
    r"\bcyanosis\b",

    # Roman Urdu - Chest & Cardiac
    r"s[ei]+n[ei]+[\s\W_]+(?:.*?[\s\W_]+)?dard",
    r"chhati[\s\W_]+(?:.*?[\s\W_]+)?dard",
    r"dil[\s\W_]+ka[\s\W_]+daura",

    # Roman Urdu - Breathing & Dyspnea
    r"s[aa]+ns[\s\W_]+(?:.*?[\s\W_]+)?phool",
    r"s[aa]+ns[\s\W_]+(?:.*?[\s\W_]+)?(?:ruk|band|dushwar|takleef)",
    r"dum[\s\W_]+ghut",

    # Roman Urdu - Bleeding
    r"khoon[\s\W_]+(?:.*?[\s\W_]+)?b(?:eh|ah)",
    r"khoon[\s\W_]+(?:.*?[\s\W_]+)?ult[ei]",

    # Roman Urdu - Consciousness & Collapse
    r"chakkar[\s\W_]+kha[\s\W_]+k(?:e)?[\s\W_]+gir",
    r"\bgash(?:i)?\b",

    # Nastaliq Urdu - Cardiopulmonary
    r"سینے[\s\W_]+(?:.*?)[\s\W_]*درد",
    r"سانس[\s\W_]+(?:.*?)[\s\W_]*(?:پھول|رک|دشواری|بند|تکلیف)",
    r"دم[\s\W_]+گھٹ",
    r"دل[\s\W_]+کا[\s\W_]+دورہ",
    r"چھاتی[\s\W_]+(?:.*?)[\s\W_]*درد",

    # Nastaliq Urdu - Bleeding & Consciousness
    r"خون[\s\W_]+(?:.*?)[\s\W_]*بہہ",
    r"خون[\s\W_]+بہنا",
    r"خون[\s\W_]+کی[\s\W_]+الٹی",
    r"غشی",
    r"فالج",
]

# ---------------------------------------------------------------------------
# Tier 2 (CLARIFICATION_REQUIRED) Triggers
# Ambiguity, illegible handwriting, missing dosage/frequency, smeared instructions
# ---------------------------------------------------------------------------
TIER_2_PATTERNS = [
    # Explicit Ambiguity Flags
    r"\bblur\w*",
    r"\bunclear\b",
    r"\bmissing\b",
    r"samajh?[\s\W_]+n(?:ah?|a)?i",
    r"واضح[\s\W_\u200c]*نہیں",
    r"twice[\s\W_]+or[\s\W_]+thrice",
    r"morning[\s\W_]+or[\s\W_]+night",
    r"\bsmear\w*",
    r"\bhand[\s\-_]*writing\b",
    r"\bsyrup\b",
    r"خوراک",

    # English - Legibility & Ambiguity
    r"\bunreadable\b",
    r"\bsmudg\w*",
    r"\billegible\b",
    r"handwriting[\s\W_]+(?:.*?[\s\W_]+)?(?:unclear|bad|poor|blurry|messy)",
    r"can(?:'t|not)[\s\W_]+(?:.*?[\s\W_]+)?read",
    r"confusing[\s\W_]+instructions",
    r"doubt[\s\W_]+on[\s\W_]+dose",

    # English - Missing Parameters
    r"missing[\s\W_]+(?:.*?[\s\W_]+)?(?:frequency|dose|dosage|instruction|time|timing)",
    r"dose[\s\W_]+(?:.*?[\s\W_]+)?missing",
    r"not[\s\W_]+sure[\s\W_]+(?:.*?[\s\W_]+)?(?:morning[\s\W_]+or[\s\W_]+night|if[\s\W_]+morning|how[\s\W_]+much|dose|frequency|when)",

    # Roman Urdu - Legibility & Ambiguity
    r"samajh[\s\W_]+n(?:ah)?i[\s\W_]+aa[\s\W_]+rah[iy]",
    r"dawa[\s\W_]+(?:.*?[\s\W_]+)?samajh[\s\W_]+n(?:ah)?i",
    r"khorak[\s\W_]+(?:.*?[\s\W_]+)?wazeh[\s\W_]+n(?:ah)?i",
    r"likhai[\s\W_]+(?:.*?[\s\W_]+)?(?:samajh[\s\W_]+n(?:ah)?i|saaf[\s\W_]+n(?:ah)?i|blur|kharab|wazeh[\s\W_]+n(?:ah)?i)",
    r"parha[\s\W_]+n(?:ah)?i[\s\W_]+ja[\s\W_]+raha",
    r"saaf[\s\W_]+nazar[\s\W_]+n(?:ah)?i",
    r"nazar[\s\W_]+n(?:ah)?i[\s\W_]+aa[\s\W_]+rah",
    r"subah[\s\W_]+leni[\s\W_]+hai[\s\W_]+ya[\s\W_]+raat",
    r"dose[\s\W_]+kitni[\s\W_]+hai",

    # Nastaliq Urdu - Ambiguity & Missing Parameters
    r"خوراک[\s\W_]+(?:.*?)[\s\W_]*واضح[\s\W_]+نہیں",
    r"دوا[\s\W_]+(?:.*?)[\s\W_]*سمجھ[\s\W_]+نہیں",
    r"سمجھ[\s\W_]+نہیں[\s\W_]+آ[\s\W_\u200c]*رہی",
    r"لکھائی[\s\W_]+(?:.*?)[\s\W_]*مدہم",
    r"\bمدہم\b",
    r"تحریر[\s\W_]+(?:.*?)[\s\W_]*واضح[\s\W_]+نہیں",
    r"ڈوز[\s\W_]+معلوم[\s\W_]+نہیں",
    r"پڑھا[\s\W_]+نہیں[\s\W_]+جا[\s\W_]+رہا",
    r"اوقات[\s\W_]+نہیں[\s\W_]+لکھے",
    r"کھانے[\s\W_]+سے[\s\W_]+پہلے[\s\W_]+ہے[\s\W_]+یا[\s\W_]+بعد[\s\W_\u200c]*(?:نہیں[\s\W_]*لکھا)?",
]


def evaluate_triage(text: str, language: str = "en") -> TriageResult:
    """
    Evaluates input text against the strict 3-Tier Clinical Safety Matrix:
    - Tier 3: Immediate emergency lockdown, triggers Rescue 1122 dispatch protocol.
    - Tier 2: Ambiguity / Missing dosage / unreadable handwriting: instructs to verify before consumption.
    - Tier 1: Routine guidance when no acute symptoms or prescription ambiguities exist.
    """
    if not text:
        return _get_routine_result(language)

    # Normalize whitespace to ensure resilience against conversational noise, line breaks, and tabs
    text_clean = " ".join(text.split())

    # Tier 3 Check (Highest Priority - Acute Red Flags)
    matched_tier3: List[str] = []
    for pattern in TIER_3_PATTERNS:
        match = re.search(pattern, text_clean, re.IGNORECASE)
        if match:
            matched_tier3.append(match.group(0))

    if matched_tier3:
        return _get_emergency_result(language, matched_tier3)

    # Tier 2 Check (Ambiguity / Missing Context / Illegible)
    matched_tier2: List[str] = []
    for pattern in TIER_2_PATTERNS:
        match = re.search(pattern, text_clean, re.IGNORECASE)
        if match:
            matched_tier2.append(match.group(0))

    if matched_tier2:
        return _get_clarification_result(language, matched_tier2)

    # Tier 1: Routine Safe (Default when no red flags or ambiguities detected)
    return _get_routine_result(language)


def _get_emergency_result(language: str, red_flags: List[str]) -> TriageResult:
    if language == "ur":
        msg = (
            "ہنگامی انتباہ (Tier-3 Emergency Lockdown): شدید طبی خطرہ ظاہر ہوا ہے۔ "
            "طبی مشورہ روک دیا گیا ہے۔ برائے مہربانی فوری طور پر ریسکیو 1122 کو کال کریں "
            "یا قریبی ایمرجنسی وارڈ میں تشریف لے جائیں۔"
        )
    elif language == "roman_ur":
        msg = (
            "[Tier-3 Emergency Lockdown]: Shadeed aur acute tibbi alamat detect hui hain. "
            "Guftagu rok di gayi hai. Barah-e-karam foran Rescue 1122 ko call karein ya qareebi Emergency Room pohnchein."
        )
    else:
        msg = (
            "[Tier-3 Emergency Lockdown]: Critical acute medical red flags detected. "
            "Automated clinical suggestions are locked. Please call Rescue 1122 immediately or present to the nearest Emergency Department."
        )

    return TriageResult(
        tier=3,
        status="EMERGENCY",
        emergency_lockdown=True,
        action="CALL_1122",
        message=msg,
        dialer_number="1122",
        detected_red_flags=red_flags,
    )


def _get_clarification_result(language: str, flags: List[str]) -> TriageResult:
    if language == "ur":
        msg = (
            "انتباہ برائے خوراک و نسخہ (Tier-2 Clarification): نسخے کی لکھائی یا خوراک کی مقدار غیر واضح ہے۔ "
            "برائے مہربانی دوا لینے سے قبل اپنے معالج یا فارماسسٹ سے لازمی تصدیق فرمائیں۔"
        )
    elif language == "roman_ur":
        msg = (
            "[Tier-2 Clarification Required]: Prescription ki likhai ya dosage wazeh nahi hai. "
            "Dawa lene se pehle apne Doctor ya Pharmacist se lazmi tasdeeq karwayen."
        )
    else:
        msg = (
            "[Tier-2 Clarification Required]: Missing dosage parameters or unreadable handwriting detected. "
            "Do NOT ingest medication until verified directly with your prescribing physician or licensed pharmacist."
        )

    return TriageResult(
        tier=2,
        status="CLARIFICATION_REQUIRED",
        emergency_lockdown=False,
        action="CONSULT_PHARMACIST_DOCTOR",
        message=msg,
        dialer_number=None,
        detected_red_flags=flags,
    )


def _get_routine_result(language: str) -> TriageResult:
    if language == "ur":
        msg = "[Tier-1 Routine Guidance]: معمول کی طبی رہنمائی فعال ہے۔ آپ ادویات کے اوقات اور پرہیز سے متعلق سوالات پوچھ سکتے ہیں۔"
    elif language == "roman_ur":
        msg = "[Tier-1 Routine Guidance]: Mamool ki tibbi rehnumai active hai. Aap dawaiyon ke timetable aur parhez ke mutalliq pooch sakte hain."
    else:
        msg = "[Tier-1 Routine Guidance]: Guidance, adherence schedule, and intake instructions verified safe."

    return TriageResult(
        tier=1,
        status="ROUTINE_SAFE",
        emergency_lockdown=False,
        action="ROUTINE_GUIDANCE",
        message=msg,
        dialer_number=None,
        detected_red_flags=[],
    )
