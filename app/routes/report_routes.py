from fastapi import APIRouter
from app.schemas.report_schema import ReportRequest
from src.components.business_advisor import BusinessAdvisor

router = APIRouter(
    prefix="/report",
    tags=["Report"]
)

advisor = BusinessAdvisor()

@router.post("/")
def report(
    request: ReportRequest
):

    return advisor.generate_report(
        request.business_context
    )