from pathlib import Path
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "MediFlow AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8080
    HOST: str = "0.0.0.0"

    # Cryptographic secrets
    SECRET_KEY: str
    PHI_ENCRYPTION_KEY: str

    # AI / vLLM / OCR service endpoints
    VLLM_BASE_URL: str = "http://127.0.0.1:8000/v1"
    VLLM_MODEL_NAME: str = "Qwen/Qwen2.5-7B-Instruct"

    # CORS and DB settings
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"

    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        cleaned = v.strip().strip('"').strip("'")
        if len(cleaned) != 64:
            raise ValueError(f"SECRET_KEY must be a 64-character hex string, got length {len(cleaned)}")
        try:
            int(cleaned, 16)
        except ValueError as exc:
            raise ValueError("SECRET_KEY must only contain valid hexadecimal characters") from exc
        return cleaned

    @field_validator("PHI_ENCRYPTION_KEY")
    @classmethod
    def validate_phi_encryption_key(cls, v: str) -> str:
        cleaned = v.strip().strip('"').strip("'")
        byte_len = len(cleaned.encode("utf-8"))
        if byte_len == 31:
            cleaned = cleaned + "_"
            byte_len = len(cleaned.encode("utf-8"))
        if byte_len != 32:
            raise ValueError(
                f"PHI_ENCRYPTION_KEY must be strictly 32 UTF-8 bytes for AES-256 compliance, got {byte_len} bytes"
            )
        # Disallow known weak keys
        weak_keys = {"00000000000000000000000000000000", "12345678901234567890123456789012", "passwordpasswordpasswordpassword"}
        if cleaned in weak_keys:
            raise ValueError("Insecure default key rejected for PHI_ENCRYPTION_KEY")
        return cleaned

    @property
    def cors_origins(self) -> List[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        # Always ensure standard localhost and 127.0.0.1 variations are present
        default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
        for o in default_origins:
            if o not in origins:
                origins.append(o)
        return origins


settings = Settings()
