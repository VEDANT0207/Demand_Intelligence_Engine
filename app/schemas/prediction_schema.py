from pydantic import BaseModel
from typing import Optional


class PredictionRequest(BaseModel):

    Store: int
    Date: str

    Promo: Optional[int] = 0
    Open: Optional[int] = 1
    StateHoliday: Optional[str] = "0"
    SchoolHoliday: Optional[int] = 0
