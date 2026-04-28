from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Projects ────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    study_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ─── Studies ─────────────────────────────────────────────────────────────────

class StudyOut(BaseModel):
    id: str
    project_id: str
    file_name: str
    page_count: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Extraction Schema ────────────────────────────────────────────────────────

class SampleSize(BaseModel):
    intervention: Optional[int] = None
    control: Optional[int] = None
    total: Optional[int] = None

class Population(BaseModel):
    condition: Optional[str] = ""
    age_mean: Optional[float] = None

class Outcome(BaseModel):
    name: Optional[str] = ""
    effect_measure: Optional[str] = ""
    effect_value: Optional[str] = ""
    confidence_interval: Optional[str] = ""
    p_value: Optional[str] = ""

class ExtractionData(BaseModel):
    study_id: Optional[str] = ""
    study_design: Optional[str] = ""
    sample_size: Optional[SampleSize] = SampleSize()
    population: Optional[Population] = Population()
    intervention: Optional[str] = ""
    comparator: Optional[str] = ""
    outcomes: Optional[List[Outcome]] = []

class ExtractionOut(BaseModel):
    id: str
    study_id: str
    json_data: Optional[Any]
    confidence_score: Optional[float]
    validation_issues: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractionUpdateRequest(BaseModel):
    json_data: ExtractionData


# ─── Validation ──────────────────────────────────────────────────────────────

class ValidationResult(BaseModel):
    confidence_score: float
    issues: List[str]
