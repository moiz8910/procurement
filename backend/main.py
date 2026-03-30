from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.routers.categories import router as categories_router
from backend.routers.transactions import router as transactions_router
from backend.routers.vendors import router as vendors_router
from backend.routers.copilot import router as copilot_router
from backend.database import engine, Base, get_db
from backend.models import PurchaseRequisition, Notification, Vendor
from backend.auth import get_current_user

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PROCURA - Procurement Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(vendors_router)
app.include_router(copilot_router)

@app.get("/")
def read_root():
    return {"message": "PROCURA API is running"}

@app.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_prs = db.query(func.count(PurchaseRequisition.id)).scalar()
    pending_prs = db.query(func.count(PurchaseRequisition.id)).filter(PurchaseRequisition.status == "Pending").scalar()
    total_spend = db.query(func.sum(PurchaseRequisition.amount)).scalar() or 0
    risky_vendors = db.query(func.count(Vendor.id)).filter(Vendor.risk_score > 0.7).scalar()
    return {
        "total_prs": total_prs,
        "pending_prs": pending_prs,
        "total_spend": round(total_spend, 2),
        "risky_vendors": risky_vendors,
    }

@app.get("/notifications")
def get_notifications(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user.id).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
