from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Dict

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2)
    member_emails: List[EmailStr]
    currency: str = "INR"

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    members: List[Dict]
    currency: str = "INR"
    created_by: str
    created_at: str
