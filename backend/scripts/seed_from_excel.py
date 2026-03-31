import os
import sys
import pandas as pd
import json
import datetime
from sqlalchemy.orm import Session

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.app.db.session import SessionLocal
from backend.app.db.models import Category, CategoryStrategy, CategoryStrategyChange

def seed():
    db = SessionLocal()
    try:
        excel_path = r"c:\Users\Yogendran\Desktop\Procurement\procurement\backend\Database\Database for Procurement.xlsx"
        print(f"Loading '{excel_path}'...")
        xls = pd.ExcelFile(excel_path)
        print("Sheets found:", xls.sheet_names)
        
        # Load Category Master if exists
        category_sheet = [s for s in xls.sheet_names if 'cat' in s.lower()][0] if any('cat' in s.lower() for s in xls.sheet_names) else None
        
        # Ensure Conveyer Belts category exists
        conveyer_cat = db.query(Category).filter(Category.name.ilike("%conveyer belt%")).first()
        if not conveyer_cat:
            conveyer_cat = Category(name="Conveyer belts", description="Material handling critical category")
            db.add(conveyer_cat)
            db.commit()
            db.refresh(conveyer_cat)
            print(f"Created category: '{conveyer_cat.name}'")
        else:
            print(f"Found category: '{conveyer_cat.name}'")

        # Create precise Strategy block matching user schema requirement
        strategy = db.query(CategoryStrategy).filter(CategoryStrategy.category_id == conveyer_cat.id).first()
        blocks = [
            "Conveyer belts are critical for material handling across jindal steers operations",
            "Standardize specifications",
            "Dual sourcing for critical belts",
            "Index-linked contracts",
            "Monitoring and predictive maintainence"
        ]
        
        if not strategy:
            strategy = CategoryStrategy(
                category_id=conveyer_cat.id,
                owner="category manager",
                next_review_date=datetime.datetime(2026, 2, 13),
                content=json.dumps(blocks)
            )
            db.add(strategy)
            print("Seeded CategoryStrategy.")
        else:
            strategy.content = json.dumps(blocks)
            strategy.owner = "category manager"
            strategy.next_review_date = datetime.datetime(2026, 2, 13)
            print("Updated CategoryStrategy.")

        db.commit()

        # Seed Recent Change
        change = db.query(CategoryStrategyChange).filter(CategoryStrategyChange.strategy_id == strategy.id).first()
        if not change:
            change1 = CategoryStrategyChange(
                strategy_id=strategy.id,
                change_description="Updated strategy to include dual sourcing and predictive maintenance.",
                changed_by="Priya"
            )
            db.add(change1)
            db.commit()
            print("Seeded CategoryStrategyChange.")

        print("Seeding successful.")
        
    except Exception as e:
        print("Error during seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
