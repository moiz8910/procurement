from fastapi import Header, HTTPException, Depends
from backend.app.db.session import get_db
from sqlalchemy.orm import Session
from backend.app.db.models import User, UserRole
from backend.app.core.rbac import has_permission

def get_current_user(x_user_id: int = Header(None), db: Session = Depends(get_db)):
    if x_user_id is None:
        # Default for demo
        user = db.query(User).filter(User.role == UserRole.CPO).first()
        return user
    
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_permission(action: str):
    def permission_checker(user: User = Depends(get_current_user)):
        if not has_permission(user.role, action):
            raise HTTPException(status_code=403, detail="Operation not permitted for this role")
        return user
    return permission_checker
