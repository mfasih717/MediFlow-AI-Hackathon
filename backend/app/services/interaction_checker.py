from typing import List, Dict, Any, Optional
from app.schemas.clinical import DrugInteractionItem

# Clinical Drug-Drug Interaction Knowledge Matrix
KNOWN_INTERACTIONS: List[Dict[str, Any]] = [
    {
        "drug_a": "warfarin",
        "drug_b": "aspirin",
        "display_a": "Warfarin",
        "display_b": "Aspirin",
        "severity": "HIGH",
        "mechanism": "Synergistic inhibition of hemostatic pathways: increased risk of major gastrointestinal and systemic hemorrhage.",
        "action_required": "Avoid concurrent use unless strictly indicated under cardiologist supervision with close INR monitoring.",
    },
    {
        "drug_a": "augmentin",
        "drug_b": "penicillin",
        "display_a": "Augmentin (Amoxicillin+Clavulanate)",
        "display_b": "Penicillin Class",
        "severity": "HIGH",
        "mechanism": "Beta-lactam cross-reactivity: risk of Type I IgE-mediated hypersensitivity, severe cutaneous adverse reactions, or anaphylaxis.",
        "action_required": "Contraindicated in documented penicillin-allergic patients. Switch to Macrolide (Azithromycin/Clarithromycin) or Fluoroquinolone.",
    },
    {
        "drug_a": "amoxicillin",
        "drug_b": "penicillin",
        "display_a": "Amoxicillin",
        "display_b": "Penicillin Class",
        "severity": "HIGH",
        "mechanism": "Beta-lactam cross-reactivity: risk of Type I hypersensitivity or allergic dermatitis.",
        "action_required": "Do not administer if patient has verified penicillin hypersensitivity.",
    },
    {
        "drug_a": "atorvastatin",
        "drug_b": "clarithromycin",
        "display_a": "Atorvastatin (Lipitor)",
        "display_b": "Clarithromycin",
        "severity": "HIGH",
        "mechanism": "Potent CYP3A4 inhibition by clarithromycin significantly spikes statin plasma levels, elevating risk of severe myopathy and rhabdomyolysis.",
        "action_required": "Temporarily suspend atorvastatin during macrolide therapy or use an alternative antibiotic.",
    },
    {
        "drug_a": "lipitor",
        "drug_b": "clarithromycin",
        "display_a": "Lipitor (Atorvastatin)",
        "display_b": "Clarithromycin",
        "severity": "HIGH",
        "mechanism": "CYP3A4 inhibition elevates statin concentrations, risking myopathy.",
        "action_required": "Suspend statin during clarithromycin treatment.",
    },
    {
        "drug_a": "omeprazole",
        "drug_b": "clopidogrel",
        "display_a": "Omeprazole / Esomeprazole (Nexum)",
        "display_b": "Clopidogrel",
        "severity": "MODERATE",
        "mechanism": "Inhibition of CYP2C19 impairs bio-activation of clopidogrel prodrug, reducing antiplatelet efficacy.",
        "action_required": "Consider switching PPI to Pantoprazole or H2-receptor antagonist (Famotidine) which exhibit minimal CYP2C19 inhibition.",
    },
    {
        "drug_a": "nexum",
        "drug_b": "clopidogrel",
        "display_a": "Nexum (Esomeprazole)",
        "display_b": "Clopidogrel",
        "severity": "MODERATE",
        "mechanism": "CYP2C19 competition diminishes clopidogrel active metabolite conversion.",
        "action_required": "Switch to Pantoprazole or Famotidine to preserve cardiovascular protection.",
    },
    {
        "drug_a": "augmentin",
        "drug_b": "methotrexate",
        "display_a": "Augmentin (Amoxicillin)",
        "display_b": "Methotrexate",
        "severity": "MODERATE",
        "mechanism": "Penicillins reduce renal tubular secretion of methotrexate, leading to elevated toxic serum levels.",
        "action_required": "Monitor complete blood counts and serum methotrexate levels closely.",
    },
    {
        "drug_a": "lisinopril",
        "drug_b": "spironolactone",
        "display_a": "Lisinopril (ACE Inhibitor)",
        "display_b": "Spironolactone / Potassium",
        "severity": "HIGH",
        "mechanism": "Dual inhibition of aldosterone action leading to life-threatening hyperkalemia.",
        "action_required": "Frequent serum potassium and renal function monitoring required.",
    },
    {
        "drug_a": "tramadol",
        "drug_b": "sertraline",
        "display_a": "Tramadol",
        "display_b": "Sertraline / SSRI",
        "severity": "HIGH",
        "mechanism": "Dual serotonergic stimulation causing Serotonin Syndrome and lowering seizure threshold.",
        "action_required": "Avoid concurrent combination or monitor for autonomic instability, hyperreflexia, and agitation.",
    },
]


def check_drug_interactions(
    medications: List[str],
    allergies: Optional[str] = None
) -> List[DrugInteractionItem]:
    """
    Evaluates medication lists and allergy profiles for clinically significant drug interactions.
    """
    detected: List[DrugInteractionItem] = []
    meds_clean = [m.lower().strip() for m in medications if m]
    allergies_clean = allergies.lower() if allergies else ""

    # Check pair-wise interactions
    for rule in KNOWN_INTERACTIONS:
        key_a = rule["drug_a"]
        key_b = rule["drug_b"]

        # Check drug-to-drug
        has_a = any(key_a in m for m in meds_clean)
        has_b = any(key_b in m for m in meds_clean)

        if has_a and has_b and key_a != key_b:
            detected.append(
                DrugInteractionItem(
                    drug_a=rule["display_a"],
                    drug_b=rule["display_b"],
                    severity=rule["severity"],
                    mechanism=rule["mechanism"],
                    action_required=rule["action_required"],
                )
            )

        # Check drug-to-allergy
        if (has_a and key_b in allergies_clean) or (has_b and key_a in allergies_clean):
            # Avoid duplicate if already detected
            existing = any(
                (d.drug_a == rule["display_a"] and d.drug_b == "Allergy Profile")
                for d in detected
            )
            if not existing:
                detected.append(
                    DrugInteractionItem(
                        drug_a=rule["display_a"],
                        drug_b=f"Allergy History ({allergies.strip() if allergies else 'Known Allergy'})",
                        severity="HIGH",
                        mechanism=f"Contraindicated hypersensitivity reaction trigger: {rule['mechanism']}",
                        action_required=rule["action_required"],
                    )
                )

    return detected
