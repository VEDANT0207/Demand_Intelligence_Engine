from pydantic import BaseModel


class ReportRequest(BaseModel):
    business_context: dict
