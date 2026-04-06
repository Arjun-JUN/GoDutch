
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class GroupMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    # email omitted intentionally — not needed in group list responses

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    member_emails: list[EmailStr]
    currency: str = "INR"

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    members: list[GroupMember]
    currency: str = "INR"
    created_by: str
    created_at: str
