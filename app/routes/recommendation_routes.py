from fastapi import APIRouter
from app.schemas.recommendation_schema import RecommendationRequest
from src.components.business_advisor import BusinessAdvisor

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

advisor = BusinessAdvisor()


@router.post("/")
def recommendations(request: RecommendationRequest):

    return advisor.generate_recommendations(request.business_context)
