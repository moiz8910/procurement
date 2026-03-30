import random
import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import User, Category, Vendor, PurchaseRequisition, PurchaseOrder, PREvent, VendorPerformance, Notification

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded.")
        return

    print("[1] Generating Users and Categories...")
    roles = ["CPO", "Category Manager", "Sourcing Analyst", "PR Requester", "SRM"]
    users = []
    for role in roles:
        user = User(name=f"{role} User", role=role)
        db.add(user)
        users.append(user)
    db.commit()

    categories_list = ["IT Hardware", "Software Licenses", "Office Supplies", "Logistics", "Consulting", "Marketing Services", "Manufacturing Tools", "Maintenance", "Travel", "Legal Services"]
    categories = []
    for cat_name in categories_list:
        category = Category(name=cat_name)
        db.add(category)
        categories.append(category)
    db.commit()

    print("[2] Generating Vendors...")
    vendors = []
    for i in range(200):
        cat = random.choice(categories)
        vendor = Vendor(
            name=f"Vendor {i+1}",
            category_id=cat.id,
            risk_score=random.uniform(0.1, 0.9),
            esg_score=random.uniform(0.3, 0.9)
        )
        db.add(vendor)
        vendors.append(vendor)
    db.commit()

    print("[3] Generating 1000 Purchase Requisitions...")
    statuses = ["Draft", "Pending", "Approved", "Rejected", "PO Created"]
    owners = ["Admin", "Finance Dept", "Procurement Team", "Category Lead"]
    
    prs = []
    requesters = [u for u in users if u.role == "PR Requester"] + [u for u in users if u.role == "Sourcing Analyst"]
    
    for i in range(1000):
        req = random.choice(requesters)
        cat = random.choice(categories)
        status = random.choice(statuses)
        
        # Create realistic date ranges
        created_at = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 365))
        
        pr = PurchaseRequisition(
            requester_id=req.id,
            category_id=cat.id,
            amount=random.uniform(500, 100000),
            status=status,
            created_at=created_at,
            current_owner=random.choice(owners),
            sla_days=random.randint(2, 30)
        )
        db.add(pr)
        prs.append(pr)
    db.commit()

    print("[4] Generating Purchase Orders and Events...")
    for pr in prs:
        # Create timeline events
        db.add(PREvent(pr_id=pr.id, stage="Draft Created", timestamp=pr.created_at))
        if pr.status != "Draft":
            db.add(PREvent(pr_id=pr.id, stage="Submitted", timestamp=pr.created_at + datetime.timedelta(hours=random.randint(1, 24))))
        
        if pr.status == "PO Created":
            vendor = random.choice([v for v in vendors if v.category_id == pr.category_id] or vendors)
            po = PurchaseOrder(
                pr_id=pr.id,
                vendor_id=vendor.id,
                value=pr.amount * random.uniform(0.95, 1.05),
                created_at=pr.created_at + datetime.timedelta(days=random.randint(5, 15))
            )
            db.add(po)
            db.add(PREvent(pr_id=pr.id, stage="PO Dispatched", timestamp=po.created_at))

    print("[5] Generating Vendor Performance and Notifications...")
    for vendor in vendors:
        perf = VendorPerformance(
            vendor_id=vendor.id,
            delivery_score=random.uniform(0.5, 1.0),
            quality_score=random.uniform(0.5, 1.0),
            price_variance=random.uniform(-0.1, 0.2)
        )
        db.add(perf)
    
    for user in users:
        for _ in range(5):
            notif = Notification(
                user_id=user.id,
                message=f"Reminder: Action required on PR #{random.randint(1, 1000)}",
                status="Unread"
            )
            db.add(notif)
            
    db.commit()
    print("Database seeding complete.")

if __name__ == "__main__":
    seed_data()
