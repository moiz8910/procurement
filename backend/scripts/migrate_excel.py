import openpyxl
from backend.app.db.session import SessionLocal, engine
from backend.app.db.models import (
    Base, User, Category, Vendor, PurchaseRequisition, PurchaseOrder, GRN, Claim,
    SupplierFeedback, PRStatus, UserRole, MarketIntelligence, VendorDiscovery, SavingsTracker,
    MaterialServiceMaster, CategoryWorkbook, CategoryWorkbookSection, MasterContractClause
)
from datetime import datetime

def parse_id(val):
    if not val: return None
    try:
        return int(str(val).split('_')[1])
    except:
        return None

def migrate_full():
    Base.metadata.drop_all(bind=engine) # Start fresh for clean migration
    Base.metadata.create_all(bind=engine)
    
    path = r"c:\Users\Yogendran\Desktop\Procurement\procurement\backend\Database\Database for Procurement.xlsx"
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    db = SessionLocal()
    
    try:
        # 1. Categories
        print("Migrating Categories...")
        sheet = wb['Category Master']
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]: continue
            db.merge(Category(id=parse_id(row[0]), name=row[1], description=row[2]))
        db.commit()

        # 2. Users
        print("Migrating Users...")
        sheet = wb['Employee Master']
        role_map = {
            'Chief Procurement Officer': UserRole.CPO,
            'Procurement Category Manager': UserRole.CATEGORY_MANAGER,
            'Sourcing Analyst': UserRole.ANALYST,
            'Requisitioner': UserRole.REQUESTER,
            'Supplier Relationship Manager': UserRole.SRM
        }
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]: continue
            db.merge(User(id=parse_id(row[0]), name=row[1], email=row[3], role=role_map.get(row[5], UserRole.ANALYST)))
        db.commit()

        # 3. Vendors
        print("Migrating Vendors...")
        sheet = wb['Vendor Master']
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]: continue
            cat = db.query(Category).filter(Category.name == row[3]).first()
            db.merge(Vendor(
                id=parse_id(row[0]), name=row[1], category_id=cat.id if cat else None,
                risk_score=(row[19] or 5)/10.0, esg_score=0.75
            ))
        db.commit()

        # 4. PRs
        print("Migrating PRs...")
        sheet = wb['Purchase Requisition']
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]: continue
            
            # Map status string to PRStatus enum if possible, else default to APPROVED
            raw_status = str(row[11] or "CREATED").strip().upper()
            status_enum = PRStatus.APPROVED
            if raw_status in ["CREATED", "APPROVED", "SOURCING", "PO_CREATED", "REJECTED"]:
                status_enum = PRStatus(raw_status)
            elif raw_status == "CLOSED":
                status_enum = PRStatus.PO_CREATED

            db.merge(PurchaseRequisition(
                id=parse_id(row[0]), 
                pr_number=str(row[0]).strip(),
                requester_id=parse_id(row[2]), 
                department=str(row[5] or ""),
                category_id=parse_id(row[6]),
                ms_id=str(row[7] or ""),
                description=str(row[8] or ""),
                amount=float(str(row[9] or 0).replace(',', '')), 
                currency=str(row[10] or "INR"),
                status=status_enum, 
                created_at=row[1] if isinstance(row[1], datetime) else datetime.utcnow(),
                approved_at=row[12] if isinstance(row[12], datetime) else None,
                required_by=row[13] if isinstance(row[13], datetime) else None,
                location_id=str(row[14] or ""),
                bu_id=str(row[15] or ""),
                priority=str(row[16] or "Medium"),
                current_owner="System", 
                sla_days=10
            ))
        db.commit()

        # 5. POs
        print("Migrating POs...")
        if 'Purchase Order' in wb.sheetnames:
            sheet = wb['Purchase Order']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.merge(PurchaseOrder(
                    id=parse_id(row[0]), po_number=str(row[0]), pr_id=parse_id(row[2]),
                    vendor_id=parse_id(row[4]), amount=row[15] or 0, currency=row[16] or "INR",
                    status=row[19] or "Issued"
                ))
            db.commit()

        # 6. GRNs
        print("Migrating GRNs...")
        if 'GRN' in wb.sheetnames:
            sheet = wb['GRN']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.merge(GRN(
                    id=parse_id(row[0]), grn_number=str(row[0]), po_id=parse_id(row[2]),
                    received_date=row[7] if isinstance(row[7], datetime) else datetime.utcnow(),
                    received_amount=row[8] or 0, quality_status=row[12] or "Accepted"
                ))
            db.commit()

        # 7. Claims
        print("Migrating Claims...")
        if 'Claims' in wb.sheetnames:
            sheet = wb['Claims']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.merge(Claim(
                    id=parse_id(row[0]), claim_number=str(row[0]), po_id=parse_id(row[1]),
                    vendor_id=parse_id(row[2]), amount=row[8] or 0, type=row[10] or "Quality",
                    status=row[11] or "Open"
                ))
            db.commit()

        # 8. Vendor Ratings (Feedback)
        print("Migrating Vendor Ratings...")
        if 'Vendor Rating' in wb.sheetnames:
            sheet = wb['Vendor Rating']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.add(SupplierFeedback(
                    vendor_id=parse_id(row[1]), rating=row[4] or 3.0,
                    comment=row[6] or "No comment", review_date=datetime.utcnow()
                ))
            db.commit()

        # 9. Intelligence (Market Intel)
        print("Migrating Market Intelligence...")
        if 'Market Intelligence' in wb.sheetnames:
            sheet = wb['Market Intelligence']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.add(MarketIntelligence(
                    category_name=row[5] if len(row) > 5 else "General", 
                    commodity=row[1] if len(row) > 1 else "Unknown", 
                    region="Global",
                    current_price="1200", 
                    price_unit="USD", 
                    trend=row[3] if len(row) > 3 else "Stable", 
                    forecast_6m="N/A"
                ))
            db.commit()

        # 10. Vendor Discovery
        print("Migrating Vendor Discovery...")
        if 'Vendor Discovery' in wb.sheetnames:
            sheet = wb['Vendor Discovery']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.add(VendorDiscovery(
                    vendor_name=row[5] if len(row) > 5 else "New Vendor", 
                    category_name=row[3] if len(row) > 3 else "General", 
                    capabilities=row[2] if len(row) > 2 else "Unknown",
                    geographical_presence="Global", 
                    scouted_by="System"
                ))
            db.commit()

        # 11. Category Workbooks
        print("Migrating Category Workbooks...")
        if 'Category Workbook' in wb.sheetnames:
            sheet = wb['Category Workbook']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                cat = db.query(Category).filter(Category.id == parse_id(row[1])).first()
                db.add(CategoryWorkbook(
                    workbook_id=str(row[0]),
                    category_id=cat.id if cat else None,
                    description=row[3],
                    owner=row[4],
                    status=row[6]
                ))
            db.commit()

        # 12. Category Workbook Sections
        print("Migrating Workbook Sections...")
        if 'Category Workbook Sections' in wb.sheetnames:
            sheet = wb['Category Workbook Sections']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.add(CategoryWorkbookSection(
                    section_id=str(row[0]),
                    workbook_id=str(row[1]),
                    section_number=int(row[4]) if row[4] else 0,
                    section_name=str(row[5]),
                    content=str(row[6])
                ))
            db.commit()

        # 13. Material Service Master
        print("Migrating Material Master...")
        if 'Material Service Master' in wb.sheetnames:
            sheet = wb['Material Service Master']
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                cat = db.query(Category).filter(Category.id == parse_id(row[3])).first()
                # Parse numeric values safely
                price = 0
                try: price = float(row[10]) # Price is column K
                except: pass
                
                annual_qty = 0
                try: annual_qty = float(row[19]) # Annual quantity
                except: pass

                db.add(MaterialServiceMaster(
                    ms_id=str(row[0]),
                    type=row[1],
                    sub_type=row[2],
                    category_id=cat.id if cat else None,
                    material_name=row[6],
                    description=row[7],
                    grade=row[8],
                    price=price,
                    uom=row[11],
                    annual_quantity=annual_qty
                ))
            db.commit()

        # 14. Master Contract Clauses
        print("Migrating Master Contract Clauses...")
        if 'Master Contract Clause' in wb.sheetnames:
            sheet = wb['Master Contract Clause']
            counter = 1
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row[0]: continue
                db.add(MasterContractClause(
                    clause_id=str(row[0]),              # Master_Clause_ID (MCC_001...)
                    clause_type=str(row[3] or ''),      # Section / Clause Type
                    clause_name=str(row[1] or ''),      # Clause_Title
                    description=str(row[1] or ''),      # Clause_Title as description too
                    standard_language=str(row[2] or ''),# Clause_Text (full clause language)
                    applicability=str(row[4] or '') if len(row) > 4 else '',
                    risk_level=str(row[5] or '') if len(row) > 5 else '',
                    is_mandatory=str(row[6] or '') if len(row) > 6 else '',
                ))
                counter += 1
            db.commit()
            print(f"  -> Inserted {counter} MCC clauses.")

        print("Full production migration completed successfully!")

    except Exception as e:
        print(f"Migration Error: {e}")
        db.rollback()
    finally:
        wb.close()
        db.close()

if __name__ == "__main__":
    migrate_full()
