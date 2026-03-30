from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from backend.database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String) # CPO, Category Manager, Sourcing Analyst, PR Requester, SRM

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    risk_score = Column(Float)
    esg_score = Column(Float)
    category = relationship("Category")

class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    amount = Column(Float)
    status = Column(String) # Draft, Pending, Approved, Rejected, PO Created
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    current_owner = Column(String)
    sla_days = Column(Integer)
    requester = relationship("User")
    category = relationship("Category")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("purchase_requisitions.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    value = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    pr = relationship("PurchaseRequisition")
    vendor = relationship("Vendor")

class PREvent(Base):
    __tablename__ = "pr_events"
    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("purchase_requisitions.id"))
    stage = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class VendorPerformance(Base):
    __tablename__ = "vendor_performance"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    delivery_score = Column(Float)
    quality_score = Column(Float)
    price_variance = Column(Float)
    vendor = relationship("Vendor")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    status = Column(String) # Unread, Read
