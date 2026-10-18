import uuid
from datetime import datetime, date
from sqlalchemy import String, Integer, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"PAT-{uuid.uuid4().hex[:6].upper()}")
    mrn: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(10), default="Unknown")
    allergies: Mapped[str] = mapped_column(Text, default="No known drug allergies")
    emergency_contact: Mapped[str] = mapped_column(String(100), default="+92 1122")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    consultations = relationship("Consultation", back_populates="patient", cascade="all, delete-orphan")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"RX-{uuid.uuid4().hex[:6].upper()}")
    patient_id: Mapped[str] = mapped_column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_name: Mapped[str] = mapped_column(String(120), default="Attending Physician")
    hospital_clinic: Mapped[str] = mapped_column(String(200), default="Outpatient Clinic")
    date_prescribed: Mapped[date] = mapped_column(Date, default=date.today)
    raw_ocr_text: Mapped[str] = mapped_column(Text, default="")
    diagnostic_intent: Mapped[str] = mapped_column(String(255), default="Clinical Consultation")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    medications = relationship("Medication", back_populates="prescription", cascade="all, delete-orphan")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"MED-{uuid.uuid4().hex[:6].upper()}")
    prescription_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("prescriptions.id"), nullable=True)
    patient_id: Mapped[str] = mapped_column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    generic_name: Mapped[str] = mapped_column(String(150), default="")
    dosage: Mapped[str] = mapped_column(String(80), nullable=False)
    frequency: Mapped[str] = mapped_column(String(120), nullable=False)
    route: Mapped[str] = mapped_column(String(50), default="Oral")
    duration: Mapped[str] = mapped_column(String(60), default="7 days")
    instructions: Mapped[str] = mapped_column(Text, default="Take as directed")
    timing_slots: Mapped[str] = mapped_column(String(100), default="Morning, Evening")
    status: Mapped[str] = mapped_column(String(30), default="active")  # active, discontinued, completed
    side_effects_noted: Mapped[str | None] = mapped_column(Text, nullable=True)
    taken_today: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="medications")
    prescription = relationship("Prescription", back_populates="medications")


class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"CON-{uuid.uuid4().hex[:6].upper()}")
    patient_id: Mapped[str] = mapped_column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_name: Mapped[str] = mapped_column(String(120), nullable=False)
    specialty: Mapped[str] = mapped_column(String(100), default="General Practice")
    clinic_name: Mapped[str] = mapped_column(String(200), default="Clinic")
    visit_date: Mapped[date] = mapped_column(Date, default=date.today)
    chief_complaint: Mapped[str] = mapped_column(Text, nullable=False)
    clinical_notes: Mapped[str] = mapped_column(Text, default="")
    treatment_outcome: Mapped[str] = mapped_column(String(50), default="partially_resolved")
    handover_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="consultations")


class InteractionWarning(Base):
    __tablename__ = "interaction_warnings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"INT-{uuid.uuid4().hex[:6].upper()}")
    medication_a: Mapped[str] = mapped_column(String(150), nullable=False)
    medication_b: Mapped[str] = mapped_column(String(150), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="MODERATE")  # HIGH, MODERATE, LOW
    clinical_rationale: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
