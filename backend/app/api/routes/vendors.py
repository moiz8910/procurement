from fastapi import APIRouter, Depends, Query
from backend.app.db.models import User
from backend.app.services.vendor_service import VendorService
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.api import deps

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("")
def get_all_vendors(user: User = Depends(deps.get_current_user), db: Session = Depends(get_db)):
    return VendorService.get_all_vendors(db)

@router.get("/dashboard/kpis")
def get_kpis(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    return VendorService.get_vendor_kpis(category_id=category_id)

@router.get("/dashboard/performance")
def get_performance(user: User = Depends(deps.get_current_user), category_id: int = Query(None)):
    return VendorService.get_performance_issues(category_id=category_id)

@router.get("/dashboard/intelligence")
def get_intelligence(user: User = Depends(deps.get_current_user), vendor_id: int = Query(None)):
    return VendorService.get_vendor_intelligence(vendor_id=vendor_id)

@router.get("/dashboard/registration")
def get_registration(user: User = Depends(deps.get_current_user)):
    return VendorService.get_registration_pipeline()

@router.get("/dashboard/sla-aging")
def get_sla_aging(user: User = Depends(deps.get_current_user)):
    return VendorService.get_sla_aging()

@router.get("/dashboard/discovery")
def get_discovery(user: User = Depends(deps.get_current_user)):
    return VendorService.get_vendor_discovery()

@router.get("/dashboard/tasks")
def get_tasks(user: User = Depends(deps.get_current_user)):
    return VendorService.get_pending_tasks()
