from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.db.models import Notification, NotificationStatus, Priority, User
from datetime import datetime

class NotificationService:
    @staticmethod
    def get_user_notifications(db: Session, user: User, status: str = None, priority: str = None):
        print(f"[NOTIFICATION] Fetching tasks for user: {user.name} ({user.role})")
        query = db.query(Notification).filter(Notification.user_id == user.id)
        
        if status and status != 'ALL':
            query = query.filter(Notification.status == status)
        else:
            # Default to not showing resolved
            query = query.filter(Notification.status != NotificationStatus.RESOLVED)
            
        if priority and priority != 'ALL':
            query = query.filter(Notification.priority == priority)
            
        print(f"[RBAC] Applied user filter for notifications. Results: {query.count()}")
        return query.order_by(Notification.created_at.desc()).all()

    @staticmethod
    def get_task_summary(db: Session, user: User):
        print(f"[TASK] Generating workload summary for {user.name}")
        total = db.query(Notification).filter(Notification.user_id == user.id, Notification.status != NotificationStatus.RESOLVED).count()
        high_priority = db.query(Notification).filter(
            Notification.user_id == user.id, 
            Notification.status != NotificationStatus.RESOLVED,
            Notification.priority == Priority.HIGH
        ).count()
        
        overdue = db.query(Notification).filter(
            Notification.user_id == user.id, 
            Notification.status != NotificationStatus.RESOLVED,
            Notification.due_date < datetime.now()
        ).count()
        
        print(f"[TASK] Debug: user_id={user.id}, total={total}, high={high_priority}, overdue={overdue}")
        
        return {
            "total": total,
            "high_priority": high_priority,
            "overdue": overdue
        }

    @staticmethod
    def mark_read(db: Session, notification_id: int):
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.status = NotificationStatus.READ
            db.commit()
        return notification

    @staticmethod
    def resolve(db: Session, notification_id: int):
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.status = NotificationStatus.RESOLVED
            db.commit()
        return notification
