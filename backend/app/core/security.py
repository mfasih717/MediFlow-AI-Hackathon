import base64
import os
import re
from typing import Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

# 32-byte key for AES-256-GCM
_AES_KEY: bytes = settings.PHI_ENCRYPTION_KEY.encode("utf-8")


def encrypt_phi(plain_text: str) -> str:
    """
    Encrypts sensitive Protected Health Information (PHI) using AES-256-GCM.
    Returns a URL-safe base64 string combining 12-byte nonce and ciphertext.
    """
    if not plain_text:
        return ""
    aesgcm = AESGCM(_AES_KEY)
    nonce = os.urandom(12)  # Standard 96-bit nonce for GCM
    data = plain_text.encode("utf-8")
    encrypted = aesgcm.encrypt(nonce, data, None)
    # Combine nonce + ciphertext
    payload = nonce + encrypted
    return base64.urlsafe_b64encode(payload).decode("utf-8")


def decrypt_phi(encrypted_text: str) -> str:
    """
    Decrypts AES-256-GCM encoded PHI strings.
    """
    if not encrypted_text:
        return ""
    try:
        payload = base64.urlsafe_b64decode(encrypted_text.encode("utf-8"))
        if len(payload) < 28:  # 12 bytes nonce + at least 16 bytes auth tag
            return encrypted_text
        nonce = payload[:12]
        ciphertext = payload[12:]
        aesgcm = AESGCM(_AES_KEY)
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        # Fallback if text is not encrypted or corrupted
        return encrypted_text


# Regex patterns for PHI/PII anonymization
CNIC_PATTERN = re.compile(r"\b\d{5}[-\s]?\d{7}[-\s]?\d\b")
PHONE_PATTERN = re.compile(r"\b(?:\+92|0092|0)?\s?3\d{2}[-\s]?\d{7}\b|\b\+?[1-9]\d{1,14}\b")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
MRN_PATTERN = re.compile(r"\b(?:MRN|PAT|MED)[-:]?\s?\d{4,8}\b", re.IGNORECASE)


def anonymize_text(text: str) -> str:
    """
    Masks personally identifiable clinical tokens (Phone, CNIC, Email, MRN)
    to enforce HIPAA/GDPR clinical anonymization.
    """
    if not text:
        return ""
    masked = CNIC_PATTERN.sub("[REDACTED_CNIC]", text)
    masked = PHONE_PATTERN.sub("[REDACTED_PHONE]", masked)
    masked = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", masked)
    masked = MRN_PATTERN.sub("[REDACTED_MRN]", masked)
    return masked


def mask_name(name: str) -> str:
    """
    Partially masks patient name for secure UI displays (e.g., 'Ahmed Khan' -> 'A**** K***').
    """
    if not name:
        return "Anonymous Patient"
    parts = name.strip().split()
    masked_parts = []
    for part in parts:
        if len(part) <= 1:
            masked_parts.append(part)
        else:
            masked_parts.append(part[0] + "*" * (len(part) - 1))
    return " ".join(masked_parts)


def mask_patient_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clones and masks patient dictionary for frontend transmission.
    """
    sanitized = dict(data)
    if "full_name" in sanitized and sanitized["full_name"]:
        sanitized["full_name_masked"] = mask_name(sanitized["full_name"])
    if "cnic" in sanitized and sanitized["cnic"]:
        sanitized["cnic"] = "[REDACTED_CNIC]"
    if "phone" in sanitized and sanitized["phone"]:
        sanitized["phone"] = "[REDACTED_PHONE]"
    return sanitized
