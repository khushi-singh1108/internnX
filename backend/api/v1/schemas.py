from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# --- Authentication Schemas ---
class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Optional[str] = "applicant"

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Applicant Schemas ---
class ApplicantProfileSchema(BaseModel):
    name: str
    email: EmailStr
    aa_category: Optional[str] = Field(None, description="E.g., Rural, Aspirational District")
    
# --- Internship Schemas ---
class InternshipCreateSchema(BaseModel):
    company_id: str
    title: str
    location: str
    required_skills: List[str]
    sector: str
    total_capacity: int = Field(default=1, ge=1, description="Maximum number of available slots")
    is_active: bool = Field(default=True, description="Whether the internship is currently accepting applications")

# --- Match Request Schema ---
class MatchRequestSchema(BaseModel):
    location_preference: Optional[str] = None
    sector_preference: Optional[str] = None

# --- Match Result Response Schema ---
class MatchResultSchema(BaseModel):
    internship_id: str
    title: str
    organization: str
    score: float
    explanation: str
    components: dict
