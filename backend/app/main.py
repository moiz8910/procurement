from fastapi import FastAPI, Depends, Query
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import pr, vendors, categories, copilot
from backend.app.core.config import settings
from backend.app.db.models import PurchaseRequisition, Vendor, Notification
from backend.app.api import deps
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from fastapi import Depends

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pr.router)
app.include_router(vendors.router)
app.include_router(categories.router)
app.include_router(copilot.router)

from backend.app.services.kpi_service import KPIService

@app.get("/kpis")
def get_kpis(
    time_range: str = None, 
    category_id: int = None, 
    vendor_id: int = None, 
    user=Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    # Only CPO and CM/Analyst see full filtered KPIs
    from backend.app.db.models import UserRole
    if user.role == UserRole.REQUESTER:
        # Limited view for Requesters - maybe only their own spend?
        # For now, let's just use the service but we might need to filter by requester_id
        return KPIService.get_filtered_kpis(db, time_range, category_id, vendor_id, requester_id=user.id)
    return KPIService.get_filtered_kpis(db, time_range, category_id, vendor_id)

from backend.app.services.notification_service import NotificationService
from backend.app.db.models import NotificationStatus

@app.get("/notifications")
def get_notifications(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    user=Depends(deps.get_current_user), 
    db: Session = Depends(get_db)
):
    return NotificationService.get_user_notifications(db, user, status, priority)

@app.get("/tasks/summary")
def get_task_summary(user=Depends(deps.get_current_user), db: Session = Depends(get_db)):
    return NotificationService.get_task_summary(db, user)

@app.patch("/notifications/{id}/mark-read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    return NotificationService.mark_read(db, id)

@app.patch("/notifications/{id}/resolve")
def resolve_notification(id: int, db: Session = Depends(get_db)):
    return NotificationService.resolve(db, id)

@app.get("/")
def read_root():
    return {"message": "PROCURA Production-ready API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
