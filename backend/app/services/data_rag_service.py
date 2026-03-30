from sqlalchemy.orm import Session
from backend.app.db.models import (
    PurchaseRequisition, PurchaseOrder, GRN, Claim, Vendor, Category, 
    MarketIntelligence, VendorDiscovery, SupplierFeedback, UserRole,
    MaterialServiceMaster, CategoryWorkbook, CategoryWorkbookSection,
    MasterContractClause
)
from datetime import datetime

class DataRAGService:
    @staticmethod
    def get_category_intelligence_context(db: Session, category_id: int):
        cat = db.query(Category).filter(Category.id == category_id).first()
        if not cat: return "Category not found."
        
        market = db.query(MarketIntelligence).filter(MarketIntelligence.category_name == cat.name).all()
        discovery = db.query(VendorDiscovery).filter(VendorDiscovery.category_name == cat.name).all()
        
        # New Strategic Intelligence Data
        materials = db.query(MaterialServiceMaster).filter(MaterialServiceMaster.category_id == cat.id).all()
        workbook = db.query(CategoryWorkbook).filter(CategoryWorkbook.category_id == cat.id).first()
        sections = []
        if workbook:
            from backend.app.db.models import CategoryWorkbookSection
            sections = db.query(CategoryWorkbookSection).filter(CategoryWorkbookSection.workbook_id == workbook.workbook_id).all()
        
        context = {
            "category": cat.name,
            "strategic_plan": [f"{s.section_name}: {s.content}" for s in sections],
            "materials_and_skus": [f"{m.material_name} ({m.type}, {m.sub_type}): ${m.price}/{m.uom}. Annual Qty: {m.annual_quantity}" for m in materials],
            "market_trends": [
                f"{m.commodity}: Price {m.current_price}{m.price_unit}, Trend {m.trend}, Forecast {m.forecast_6m}"
                for m in market
            ],
            "scouted_vendors": [
                f"{v.vendor_name}: {v.capabilities} ({v.geographical_presence})"
                for v in discovery
            ]
        }
        return context

    @staticmethod
    def get_vendor_risk_context(db: Session, vendor_id: int):
        ven = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not ven: return "Vendor not found."
        
        feedback = db.query(SupplierFeedback).filter(SupplierFeedback.vendor_id == vendor_id).all()
        claims = db.query(Claim).filter(Claim.vendor_id == vendor_id).all()
        
        context = {
            "vendor": ven.name,
            "risk_score": ven.risk_score,
            "esg_score": ven.esg_score,
            "recent_feedback": [f"Rating {f.rating}: {f.comment}" for f in feedback[-5:]],
            "open_claims": [f"Claim#{c.claim_number}: {c.amount} ({c.type})" for c in claims if c.status == "Open"]
        }
        return context

    @staticmethod
    def get_transaction_bottleneck_context(db: Session, user, query_text: str = ""):
        import re
        # Look for a specific PR ID like PR_00001
        id_match = re.search(r'PR_?\d+', query_text, re.IGNORECASE)
        
        query = db.query(PurchaseRequisition)
        if user.role == UserRole.REQUESTER and not id_match:
            query = query.filter(PurchaseRequisition.requester_id == user.id)
            
        if id_match:
            pr_id_str = id_match.group(0).upper().replace('PR', 'PR_') if '_' not in id_match.group(0) else id_match.group(0).upper()
            prs = query.filter(PurchaseRequisition.pr_number == pr_id_str).all()
        else:
            prs = query.filter(PurchaseRequisition.status != "PO_CREATED").limit(10).all()
        
        if not prs:
            return {"error": "No matching Purchase Requisitions found."}
            
        context = []
        for pr in prs:
            po = db.query(PurchaseOrder).filter(PurchaseOrder.pr_id == pr.id).first()
            grn = db.query(GRN).filter(GRN.po_id == po.id).first() if po else None
            
            context.append({
                "pr_number": pr.pr_number or f"PR-{pr.id}",
                "description": pr.description,
                "department": pr.department,
                "priority": pr.priority,
                "ms_id": pr.ms_id,
                "status": pr.status,
                "amount": f"{pr.amount} {pr.currency}",
                "owner": pr.current_owner,
                "po_issued": po.po_number if po else "No",
                "receipt_status": "Received" if grn else "Pending"
            })
        return {"purchase_requisitions": context}

    @staticmethod
    def get_contract_clause_context(db: Session, query_text: str):
        """Search contract clauses by ID or keyword in name/description."""
        import re
        
        # Look for a specific clause ID like MCC_001
        id_match = re.search(r'MCC_?\d+', query_text, re.IGNORECASE)
        if id_match:
            clause_id = id_match.group(0).upper().replace('MCC', 'MCC_') if '_' not in id_match.group(0) else id_match.group(0).upper()
            clauses = db.query(MasterContractClause).filter(MasterContractClause.clause_id == clause_id).all()
        else:
            # Full-text keyword search on name and description
            clauses = db.query(MasterContractClause).filter(
                MasterContractClause.clause_name.ilike(f"%{query_text}%") |
                MasterContractClause.description.ilike(f"%{query_text}%") |
                MasterContractClause.clause_type.ilike(f"%{query_text}%")
            ).limit(10).all()
        
        if not clauses:
            return {"error": "No matching contract clauses found in the database."}
        
        return {
            "contract_clauses": [
                {
                    "clause_id": c.clause_id,
                    "type": c.clause_type,
                    "name": c.clause_name,
                    "description": c.description,
                    "standard_language": c.standard_language,
                    "applicability": c.applicability,
                    "risk_level": c.risk_level,
                    "mandatory": c.is_mandatory,
                }
                for c in clauses
            ]
        }

