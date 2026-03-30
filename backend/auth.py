from fastapi import Header, HTTPException, Depends
from backend.database import get_db
from sqlalchemy.orm import Session
from backend.models import User

def get_current_user(x_user_id: int = Header(None), db: Session = Depends(get_db)):
    if x_user_id is None:
        # For demo purposes, default to CPO if no header
        user = db.query(User).filter(User.role == "CPO").first()
        return user
    
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def check_role(allowed_roles: list):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles and "CPO" != user.role:
            raise HTTPException(status_code=403, detail="Operation not permitted for this role")
        return user
    return role_checker
