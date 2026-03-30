from fastapi import APIRouter, Depends, Query
from backend.app.api import deps
from backend.app.db.models import User
from backend.app.services.vendor_service import VendorService

router = APIRouter(prefix="/vendors", tags=["Vendors"])

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
