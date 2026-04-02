from pydantic import BaseModel, ConfigDict


class SettlementItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    amount: float

class MarkPaidRequest(BaseModel):
    group_id: str
    from_user_id: str
    to_user_id: str
    amount: float
