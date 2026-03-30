from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.db.models import Category, PurchaseOrder, Vendor
from backend.app.api import deps

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", dependencies=[Depends(deps.require_permission("category:read"))])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/{category_id}/spend", dependencies=[Depends(deps.require_permission("category:read"))])
def get_category_spend(category_id: int, db: Session = Depends(get_db)):
    total_spend = db.query(func.sum(PurchaseOrder.value)).join(Vendor).filter(Vendor.category_id == category_id).scalar() or 0
    return {"category_id": category_id, "total_spend": total_spend}

from backend.app.services.category_service import CategoryService
from pydantic import BaseModel
from typing import List

class StrategyUpdate(BaseModel):
    content_blocks: List[str]

@router.get("/{category_id}/kpis")
def get_category_kpis(category_id: int, db: Session = Depends(get_db)):
    # Assuming RBAC is checked at UI or via deps
    return CategoryService.get_category_kpis(db, category_id)

@router.get("/{category_id}/strategy")
def get_category_strategy(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.get_strategy(db, category_id)

@router.get("/{category_id}/strategy/changes")
def get_strategy_changes(category_id: int, days: int = 7, db: Session = Depends(get_db)):
    return CategoryService.get_recent_changes(db, category_id, days)

@router.post("/{category_id}/strategy")
def update_category_strategy(category_id: int, payload: StrategyUpdate, db: Session = Depends(get_db), current_user = Depends(deps.get_current_user)):
    return CategoryService.update_strategy(db, category_id, payload.content_blocks, current_user.name)

@router.post("/{category_id}/strategy/insights")
def generate_strategy_insights(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.generate_ai_insights(db, category_id)

@router.post("/{category_id}/strategy/upload")
def upload_category_strategy(category_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(deps.get_current_user)):
    content = file.file.read().decode("utf-8", errors="ignore")
    return CategoryService.upload_strategy(db, category_id, content, current_user.name)

@router.post("/{category_id}/strategy/summarize")
def summarize_category_strategy(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.summarize_strategy(db, category_id)

class CopilotEditRequest(BaseModel):
    prompt: str

@router.post("/{category_id}/strategy/copilot-edit")
def copilot_edit_strategy(category_id: int, payload: CopilotEditRequest, db: Session = Depends(get_db), current_user = Depends(deps.get_current_user)):
    return CategoryService.copilot_edit_strategy(db, category_id, payload.prompt, current_user.name)

@router.get("/{category_id}/spend-analysis")
def get_spend_analysis(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.get_spend_analysis(db, category_id)

@router.post("/{category_id}/spend-analysis/analyze")
def trigger_spend_analysis(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.get_spend_insights_analysis(db, category_id)

@router.get("/{category_id}/tasks")
def get_category_tasks(category_id: int, db: Session = Depends(get_db), current_user = Depends(deps.get_current_user)):
    return CategoryService.get_pending_tasks(db, category_id, current_user.id)

@router.post("/{category_id}/tasks/{task_id}/toggle")
def toggle_category_task(category_id: int, task_id: int, db: Session = Depends(get_db), current_user = Depends(deps.get_current_user)):
    return CategoryService.toggle_task(db, task_id)

@router.get("/{category_id}/market-intelligence")
def get_category_market_intelligence(category_id: int, db: Session = Depends(get_db)):
    return CategoryService.get_market_intelligence(db, category_id)



