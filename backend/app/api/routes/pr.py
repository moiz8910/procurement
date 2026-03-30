from fastapi import APIRouter, Depends, Query
from backend.app.api import deps
from backend.app.db.models import User
from backend.app.services.transaction_service import TransactionService

router = APIRouter(prefix="/pr", tags=["Transactions"])

@router.get("/pipeline")
def get_pipeline(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    return TransactionService.get_pipeline_dashboard(category_id=category_id)

@router.get("/aging")
def get_aging(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    return TransactionService.get_aging_analysis(category_id=category_id)

@router.get("/slas")
def get_slas(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    return TransactionService.get_sla_heatmap(category_id=category_id)

@router.get("/list")
def list_prs(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    # Requesters only get their own data, others get all (or scoped by category)
    req_id = user.id if user.role.value == "REQUESTER" else None
    return TransactionService.get_pr_list(category_id=category_id, requester_id=req_id)

@router.get("/{pr_id}/gantt")
def get_pr_gantt(pr_id: str, user: User = Depends(deps.get_current_user)):
    req_id = user.id if user.role.value == "REQUESTER" else None
    return TransactionService.get_pr_details(pr_id, requester_id=req_id)
