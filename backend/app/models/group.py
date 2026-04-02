
from pydantic import BaseModel, ConfigDict, EmailStr, Field

<<<<<<< HEAD

class GroupMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    # email omitted intentionally — not needed in group list responses

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
=======

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2)
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)
    member_emails: list[EmailStr]
    currency: str = "INR"

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
<<<<<<< HEAD
    members: list[GroupMember]
=======
    members: list[dict]
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)
    currency: str = "INR"
    created_by: str
    created_at: str
