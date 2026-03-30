from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Vendor, VendorPerformance
from backend.auth import check_role

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("")
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@router.get("/{vendor_id}")
def get_vendor_detail(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    perf = db.query(VendorPerformance).filter(VendorPerformance.vendor_id == vendor_id).first()
    return {"vendor": vendor, "performance": perf}

@router.get("/compare")
def compare_vendors(vendor_ids: str, db: Session = Depends(get_db)):
    v_ids = [int(i) for i in vendor_ids.split(",")]
    vendors = db.query(Vendor).filter(Vendor.id.in_(v_ids)).all()
    return vendors
