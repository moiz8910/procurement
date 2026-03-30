from sqlalchemy.orm import Session
from backend.app.db.models import PurchaseRequisition, PurchaseOrder, UserRole
from backend.app.core.rbac import filter_pr_by_role

class PRService:
    @staticmethod
    def get_prs(db: Session, user):
        print(f"[RBAC] Applying role filter for {user.role}")
        query = db.query(PurchaseRequisition)
        query = filter_pr_by_role(user, query)
        return query.all()

    @staticmethod
    def get_pr_by_id(db: Session, pr_id: int, user):
        pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
        if not pr:
            return None
        
        # Additional manual check for REQUESTER
        if user.role == UserRole.REQUESTER and pr.requester_id != user.id:
            return None
        return pr

class VendorService:
    @staticmethod
    def get_vendors(db: Session):
        return db.query(Vendor).all()
        
    @staticmethod
    def get_vendor_detail(db: Session, vendor_id: int):
        from backend.app.db.models import Vendor, VendorPerformance
        return db.query(Vendor).filter(Vendor.id == vendor_id).first()
