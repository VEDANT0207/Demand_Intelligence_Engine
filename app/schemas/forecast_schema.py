from pydantic import BaseModel, Field
from typing import Optional


class ForecastRequest(BaseModel):

    Store: int = Field(example=1)

    Date: str = Field(example="2015-08-01")

    target_date: Optional[str] = Field(default=None, example="2015-10-05")

    forecast_days: Optional[int] = Field(default=None, example=90)

    Promo: Optional[int] = 0
    Open: Optional[int] = 1
    StateHoliday: Optional[str] = "0"
    SchoolHoliday: Optional[int] = 0
