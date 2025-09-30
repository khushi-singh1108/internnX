from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic v2 compatibility."""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)

# Base Model for all documents
class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = {
        "json_encoders": {ObjectId: str},
        "populate_by_name": True,
        "arbitrary_types_allowed": True  # Needed for PyObjectId
    }

# --- User Model (Stores credentials and roles) ---
class UserModel(MongoBaseModel):
    user_id: str = Field(..., unique=True, index=True)
    email: str = Field(...)
    hashed_password: str = Field(...)
    role: str = Field(default="applicant")
    # Applicant-specific fields
    name: str = Field(...)
    aa_category: Optional[str] = None
    district_id: Optional[str] = None
    past_participation: Optional[bool] = False
    
# --- Internship Model (Opportunity details) ---
class InternshipModel(MongoBaseModel):
    company_id: str = Field(...)
    title: str = Field(...)
    location: str = Field(...)
    required_skills: List[str] = Field(default_factory=list)
    sector: str = Field(...)
    total_capacity: int = Field(default=1)
    slots_filled: int = Field(default=0)
    is_active: bool = Field(default=True)

# --- Match/Allocation Result Model ---
class MatchResultModel(MongoBaseModel):
    applicant_id: str = Field(...)
    internship_id: str = Field(...)
    s_final: float = Field(default=0.0)
    s_skill: float = Field(default=0.0)
    s_fairness_boost: float = Field(default=1.0)
    reasoning: str = Field(...)
    allocation_status: str = Field(default="Pending")
