import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.security import encrypt_phi, decrypt_phi, anonymize_text
from app.services.triage import evaluate_triage
from app.services.interaction_checker import check_drug_interactions


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_settings_validation():
    assert len(settings.SECRET_KEY) == 64
    assert len(settings.PHI_ENCRYPTION_KEY.encode("utf-8")) == 32
    assert "http://localhost:3000" in settings.cors_origins


def test_phi_encryption_and_anonymization():
    raw_phi = "Patient Ahmed Khan CNIC 35202-1234567-1 Phone +923001234567"
    masked = anonymize_text(raw_phi)
    assert "[REDACTED_CNIC]" in masked
    assert "[REDACTED_PHONE]" in masked

    secret_note = "Patient has sensitive psychiatric history"
    encrypted = encrypt_phi(secret_note)
    assert encrypted != secret_note
    decrypted = decrypt_phi(encrypted)
    assert decrypted == secret_note


def test_triage_tier_3_emergency():
    # English
    res_en = evaluate_triage("I am having acute chest pain and sweating", language="en")
    assert res_en.tier == 3
    assert res_en.status == "EMERGENCY"
    assert res_en.emergency_lockdown is True
    assert res_en.dialer_number == "1122"

    # Roman Urdu
    res_ru = evaluate_triage("Mera seene mein dard bohot barh gaya hai", language="roman_ur")
    assert res_ru.tier == 3
    assert res_ru.status == "EMERGENCY"
    assert res_ru.emergency_lockdown is True
    assert "1122" in res_ru.message

    # Urdu Nastaliq
    res_ur = evaluate_triage("مجھے سینے میں شدید درد ہو رہا ہے اور سانس لینے میں دشواری ہے", language="ur")
    assert res_ur.tier == 3
    assert res_ur.status == "EMERGENCY"


def test_triage_tier_2_clarification():
    res_clarify = evaluate_triage("The prescription is blurry and dose missing", language="en")
    assert res_clarify.tier == 2
    assert res_clarify.status == "CLARIFICATION_REQUIRED"
    assert res_clarify.emergency_lockdown is False


def test_triage_tier_1_routine():
    res_routine = evaluate_triage("When should I take my morning Nexum capsule?", language="en")
    assert res_routine.tier == 1
    assert res_routine.status == "ROUTINE_SAFE"


def test_drug_interaction_checker():
    # Warfarin + Aspirin should trigger HIGH severity
    results = check_drug_interactions(["Warfarin 5mg", "Aspirin 75mg"])
    assert len(results) >= 1
    assert any(r.severity == "HIGH" for r in results)

    # Penicillin allergy check with Augmentin
    allergy_results = check_drug_interactions(["Augmentin 625mg"], allergies="Penicillin allergy")
    assert len(allergy_results) >= 1
    assert any(r.severity == "HIGH" for r in allergy_results)


def test_api_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "rocm_telemetry" in data
    assert data["rocm_telemetry"]["rocm_available"] is True


def test_api_chat_emergency(client):
    response = client.post(
        "/api/v1/chat",
        json={"message": "Severe chest pain and difficulty breathing", "language": "en"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["triage"]["tier"] == 3
    assert data["triage"]["emergency_lockdown"] is True
    assert data["triage"]["dialer_number"] == "1122"


def test_api_timeline(client):
    response = client.get("/api/v1/timeline?patient_id=PAT-9082")
    assert response.status_code == 200
    data = response.json()
    assert "slots" in data
    assert len(data["slots"]) == 4


def test_api_doctor_handover_summary(client):
    response = client.get("/api/v1/patient/summary?patient_id=PAT-9082")
    assert response.status_code == 200
    data = response.json()
    assert "patient_demographics" in data
    assert "chief_complaints_timeline" in data
    assert "treatment_failures" in data
    assert "active_medications" in data
    assert "drug_interactions" in data
