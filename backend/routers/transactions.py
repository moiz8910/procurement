from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import PurchaseRequisition, PREvent, User
from backend.auth import get_current_user, check_role

router = APIRouter(prefix="/pr", tags=["Transactions"])

@router.get("/list")
def list_prs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # PR Requester only sees their own
    if user.role == "PR Requester":
        return db.query(PurchaseRequisition).filter(PurchaseRequisition.requester_id == user.id).all()
    return db.query(PurchaseRequisition).all()

@router.get("/{pr_id}")
def get_pr(pr_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    # RBAC check
    if user.role == "PR Requester" and pr.requester_id != user.id:
        return {"detail": "Access forbidden"}
    return pr

@router.get("/{pr_id}/timeline")
def get_pr_timeline(pr_id: int, db: Session = Depends(get_db)):
    return db.query(PREvent).filter(PREvent.pr_id == pr_id).all()
