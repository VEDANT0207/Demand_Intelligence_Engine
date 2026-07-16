from pydantic import BaseModel

class ChatRequest(BaseModel):
    business_context: dict
    question: str