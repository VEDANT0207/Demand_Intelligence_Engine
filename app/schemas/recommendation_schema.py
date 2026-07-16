from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    business_context: dict