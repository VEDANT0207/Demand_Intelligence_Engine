from fastapi import APIRouter
from app.schemas.chat_schema import ChatRequest
from src.components.business_advisor import BusinessAdvisor

router = APIRouter(prefix="/chat", tags=["Chat"])

advisor = BusinessAdvisor()


@router.post("/")
def chat(request: ChatRequest):

    return advisor.answer_question(request.business_context, request.question)
