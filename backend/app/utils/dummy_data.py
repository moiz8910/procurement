import random
from faker import Faker
from datetime import datetime, timedelta
from backend.app.db.models import (
    User, Category, Vendor, PurchaseRequisition, PurchaseOrder, PREvent, 
    VendorPerformance, Notification, UserRole, PRStatus, 
    NotificationType, NotificationStatus, Priority
)
from backend.app.db.session import SessionLocal

fake = Faker()

def generate_dummy_data():
    db = SessionLocal()
    
    # [1] Generate Users
    print("[DB] Generating Users...")
    role_counts = {
        UserRole.CPO: 5,
        UserRole.CATEGORY_MANAGER: 10,
        UserRole.ANALYST: 20,
        UserRole.REQUESTER: 50,
        UserRole.SRM: 10
    }
    
    users = []
    for role, count in role_counts.items():
        for _ in range(count):
            user = User(name=fake.name(), role=role, email=fake.email())
            db.add(user)
            users.append(user)
    db.commit()
    
    # [2] Generate Categories
    print("[DB] Generating Categories...")
    categories = []
    for _ in range(20):
        category = Category(name=fake.catch_phrase())
        db.add(category)
        categories.append(category)
    db.commit()

    # [3] Generate Vendors
    print("[DB] Generating Vendors...")
    vendors = []
    for _ in range(100):
        cat = random.choice(categories)
        vendor = Vendor(
            name=fake.company(),
            category_id=cat.id,
            risk_score=random.uniform(0.1, 0.9),
            esg_score=random.uniform(0.3, 0.9)
        )
        db.add(vendor)
        vendors.append(vendor)
    db.commit()

    # [4] Generate PRs
    print("[DB] Generating 500 PRs...")
    requesters = [u for u in users if u.role == UserRole.REQUESTER]
    prs = []
    for i in range(500):
        req = random.choice(requesters)
        cat = random.choice(categories)
        status = random.choice(list(PRStatus))
        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 180))
        
        pr = PurchaseRequisition(
            requester_id=req.id,
            category_id=cat.id,
            amount=random.uniform(1000, 500000),
            status=status,
            created_at=created_at,
            current_owner=fake.name(),
            sla_days=random.randint(1, 20)
        )
        db.add(pr)
        db.commit() # Commit to get ID
        prs.append(pr)
        
        # Timeline events
        db.add(PREvent(pr_id=pr.id, stage="CREATED", timestamp=created_at))
        if status != PRStatus.CREATED:
            db.add(PREvent(pr_id=pr.id, stage="SUBMITTED", timestamp=created_at + timedelta(hours=random.randint(1, 48))))
    
    db.commit()

    # [5] Notifications & Tasks (Context Aware)
    print("[DB] Generating 1000 Notifications & Tasks...")
    notifications = []
    
    for _ in range(1000):
        user = random.choice(users)
        notif_type = random.choices(
            [NotificationType.APPROVAL, NotificationType.ALERT, NotificationType.REMINDER, NotificationType.SYSTEM],
            weights=[0.4, 0.3, 0.2, 0.1]
        )[0]
        
        priority = random.choices(
            [Priority.LOW, Priority.MEDIUM, Priority.HIGH],
            weights=[0.3, 0.5, 0.2]
        )[0]
        
        status = random.choices(
            [NotificationStatus.UNREAD, NotificationStatus.READ, NotificationStatus.RESOLVED],
            weights=[0.5, 0.3, 0.2]
        )[0]
        
        created_at = fake.date_time_between(start_date='-30d', end_date='now')
        due_date = fake.date_time_between(start_date='now', end_date='+14d') if random.random() > 0.5 else None
        
        message = ""
        related_type = None
        related_id = None
        
        if notif_type == NotificationType.APPROVAL:
            pr = random.choice(prs)
            message = f"Approval required for PR #{pr.id} - ${pr.amount:,.0f}"
            related_type = "PR"
            related_id = pr.id
        elif notif_type == NotificationType.ALERT:
            if random.random() > 0.5:
                pr = random.choice(prs)
                message = f"SLA Breach: PR #{pr.id} has been stuck for {pr.sla_days} days"
                related_type = "PR"
                related_id = pr.id
            else:
                v = random.choice(vendors)
                message = f"Vendor Risk Alert: {v.name} risk score increased to {v.risk_score:.2f}"
                related_type = "VENDOR"
                related_id = v.id
        elif notif_type == NotificationType.REMINDER:
            message = f"Reminder: Review pending documents for Quarter {random.randint(1,4)}"
        else:
            message = f"System Update: Workspace {fake.word()} maintenance scheduled"

        notifications.append(Notification(
            user_id=user.id,
            type=notif_type,
            message=message,
            priority=priority,
            status=status,
            related_entity_type=related_type,
            related_entity_id=related_id,
            created_at=created_at,
            due_date=due_date
        ))
    
    db.add_all(notifications)
    
    # [6] Vendor Performance
    print("[DB] Generating Vendor Performance...")
    for vendor in vendors:
        perf = VendorPerformance(
            vendor_id=vendor.id,
            delivery_score=random.uniform(0.5, 1.0),
            quality_score=random.uniform(0.5, 1.0),
            price_variance=random.uniform(-0.1, 0.2)
        )
        db.add(perf)
        
    db.commit()
    db.close()
    print("[DB] Seeding complete.")

if __name__ == "__main__":
    generate_dummy_data()
