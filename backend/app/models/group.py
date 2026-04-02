
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2)
    member_emails: list[EmailStr]
    currency: str = "INR"

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    members: list[dict]
    currency: str = "INR"
    created_by: str
    created_at: str
