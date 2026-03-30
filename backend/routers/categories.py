from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Category, PurchaseOrder, Vendor
from backend.auth import check_role
from sqlalchemy import func

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/{category_id}/spend")
def get_category_spend(category_id: int, db: Session = Depends(get_db)):
    total_spend = db.query(func.sum(PurchaseOrder.value)).join(Vendor).filter(Vendor.category_id == category_id).scalar() or 0
    return {"category_id": category_id, "total_spend": total_spend}

@router.get("/{category_id}/insights")
def get_category_insights(category_id: int, db: Session = Depends(get_db)):
    # Mock insights for now, will be replaced by AI
    return [
        {"type": "Savings Opportunity", "message": "High price variance detected in this category. Suggest consolidating vendors."},
        {"type": "Market Intelligence", "message": "Market prices for this category are trending down by 5%."}
    ]
