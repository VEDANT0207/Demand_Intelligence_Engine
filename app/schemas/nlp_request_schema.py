from pydantic import BaseModel

class NLPRequest(BaseModel):
    query: str