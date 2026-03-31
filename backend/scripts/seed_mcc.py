"""
Targeted seed script for Master Contract Clause data.
Reads from the Excel file and inserts into the existing database
WITHOUT dropping other tables.
"""
import openpyxl
import sys, os
sys.path.insert(0, r'c:\Users\Yogendran\Desktop\Procurement\procurement')

from backend.app.db.session import SessionLocal, engine
from backend.app.db.models import Base, MasterContractClause

# Ensure the table exists
Base.metadata.create_all(bind=engine)

path = r"c:\Users\Yogendran\Desktop\Procurement\procurement\backend\Database\Database for Procurement.xlsx"
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
db = SessionLocal()

try:
    # Clear existing MCC records first
    deleted = db.query(MasterContractClause).delete()
    db.commit()
    print(f"Cleared {deleted} old MCC records.")

    sheet = wb['Master Contract Clause']
    count = 0
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row[0] or not str(row[0]).startswith('MCC'):
            continue
        db.add(MasterContractClause(
            clause_id=str(row[0]).strip(),              # Master_Clause_ID (MCC_001)
            clause_name=str(row[1] or '').strip(),      # Clause_Title
            standard_language=str(row[2] or '').strip(),# Clause_Text (full clause language)
            clause_type=str(row[3] or '').strip(),      # Section / Clause Type
            description=str(row[1] or '').strip(),      # Use title as description
            applicability=str(row[4] or '').strip() if len(row) > 4 else '',
            risk_level=str(row[5] or '').strip() if len(row) > 5 else '',
            is_mandatory=str(row[6] or '').strip() if len(row) > 6 else '',
        ))
        count += 1

    db.commit()
    print(f"Successfully seeded {count} Master Contract Clauses!")
    
    # Verify
    total = db.query(MasterContractClause).count()
    first = db.query(MasterContractClause).first()
    print(f"Total in DB: {total}")
    if first:
        print(f"Sample: {first.clause_id} | {first.clause_name}")
        print(f"  Text: {first.standard_language[:150]}...")

except Exception as e:
    import traceback
    print(f"Error: {traceback.format_exc()}")
    db.rollback()
finally:
    wb.close()
    db.close()
