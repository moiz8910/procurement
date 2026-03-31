import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from backend.app.db.session import Base

class UserRole(str, enum.Enum):
    CPO = "CPO"
    CATEGORY_MANAGER = "CATEGORY_MANAGER"
    ANALYST = "ANALYST"
    REQUESTER = "REQUESTER"
    SRM = "SRM"

class PRStatus(str, enum.Enum):
    CREATED = "CREATED"
    APPROVED = "APPROVED"
    SOURCING = "SOURCING"
    PO_CREATED = "PO_CREATED"
    REJECTED = "REJECTED"

class NotificationType(str, enum.Enum):
    APPROVAL = "APPROVAL"
    ALERT = "ALERT"
    REMINDER = "REMINDER"
    SYSTEM = "SYSTEM"

class NotificationStatus(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"
    RESOLVED = "RESOLVED"

class Priority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole))
    
    # Relationships
    notifications = relationship("Notification", back_populates="user")
    prs = relationship("PurchaseRequisition", back_populates="requester")

class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    
    # Relationships
    vendors = relationship("Vendor", back_populates="category")
    prs = relationship("PurchaseRequisition", back_populates="category")

class Vendor(Base):
    __tablename__ = "vendor"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category_id = Column(Integer, ForeignKey("category.id"))
    risk_score = Column(Float)
    esg_score = Column(Float)
    
    # Relationships
    category = relationship("Category", back_populates="vendors")
    performances = relationship("VendorPerformance", back_populates="vendor")
    feedbacks = relationship("SupplierFeedback", back_populates="vendor")


class PurchaseRequisition(Base):
    __tablename__ = "purchaserequisition"
    id = Column(Integer, primary_key=True, index=True)
    pr_number = Column(String, unique=True, index=True, nullable=True)  # 'PR_00001'
    requester_id = Column(Integer, ForeignKey("user.id"))
    category_id = Column(Integer, ForeignKey("category.id"))
    amount = Column(Float)
    currency = Column(String, default="INR")
    description = Column(String, nullable=True)
    department = Column(String, nullable=True)
    ms_id = Column(String, nullable=True)        # Material/Service ID or name
    status = Column(SQLEnum(PRStatus))
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    required_by = Column(DateTime, nullable=True)
    current_owner = Column(String)
    sla_days = Column(Integer)
    priority = Column(String, nullable=True)     # Low/Medium/High
    location_id = Column(String, nullable=True)
    bu_id = Column(String, nullable=True)
    
    # Relationships
    category = relationship("Category", back_populates="prs")
    requester = relationship("User", back_populates="prs")

class PurchaseOrder(Base):
    __tablename__ = "purchaseorder"
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True)
    pr_id = Column(Integer, ForeignKey("purchaserequisition.id"))
    vendor_id = Column(Integer, ForeignKey("vendor.id"))
    amount = Column(Float)
    currency = Column(String, default="USD")
    status = Column(String) # Issued, Partial, Closed
    mode_of_purchase = Column(String, nullable=True) # Rate Contract, RFX, LOI
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    pr = relationship("PurchaseRequisition")
    vendor = relationship("Vendor")
    grns = relationship("GRN", back_populates="po")

class GRN(Base):
    __tablename__ = "grn"
    id = Column(Integer, primary_key=True, index=True)
    grn_number = Column(String, unique=True)
    po_id = Column(Integer, ForeignKey("purchaseorder.id"))
    received_date = Column(DateTime)
    received_amount = Column(Float)
    quality_status = Column(String) # Accepted, Rejected, Pending
    
    # Relationships
    po = relationship("PurchaseOrder", back_populates="grns")

class Claim(Base):
    __tablename__ = "claim"
    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String, unique=True)
    po_id = Column(Integer, ForeignKey("purchaseorder.id"), nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendor.id"))
    amount = Column(Float)
    type = Column(String) # Quality, Shortage, Delay
    status = Column(String) # Open, Resolved, Disputed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vendor = relationship("Vendor")
    po = relationship("PurchaseOrder")


class SupplierFeedback(Base):
    __tablename__ = "supplierfeedback"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor.id"))
    rating = Column(Float) # 1-5
    comment = Column(String)
    review_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vendor = relationship("Vendor", back_populates="feedbacks")


class PREvent(Base):
    __tablename__ = "prevent"
    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("purchaserequisition.id"))
    stage = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class VendorPerformance(Base):
    __tablename__ = "vendorperformance"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor.id"))
    delivery_score = Column(Float)
    quality_score = Column(Float)
    price_variance = Column(Float)
    
    # Relationships
    vendor = relationship("Vendor", back_populates="performances")

class Notification(Base):
    __tablename__ = "notification"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM)
    message = Column(String)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.UNREAD)
    related_entity_type = Column(String, nullable=True) # PR, VENDOR, CATEGORY
    related_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class MarketIntelligence(Base):
    __tablename__ = "marketintelligence"
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String)
    commodity = Column(String)
    region = Column(String)
    current_price = Column(Float)
    price_unit = Column(String)
    trend = Column(String) # Rising, Falling, Stable
    forecast_6m = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)

class VendorDiscovery(Base):
    __tablename__ = "vendordiscovery"
    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String)
    category_name = Column(String)
    capabilities = Column(String)
    geographical_presence = Column(String)
    discovery_date = Column(DateTime, default=datetime.utcnow)
    scouted_by = Column(String)

class SavingsTracker(Base):
    __tablename__ = "savingstracker"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    category_id = Column(Integer, ForeignKey("category.id"))
    planned_savings = Column(Float)
    realized_savings = Column(Float)
    status = Column(String) # Identified, In Progress, Realized
    
    # Relationships
    category = relationship("Category")

class MaterialServiceMaster(Base):
    __tablename__ = "materialservicemaster"
    id = Column(Integer, primary_key=True, index=True)
    ms_id = Column(String, unique=True, index=True)
    type = Column(String)
    sub_type = Column(String)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    material_name = Column(String)
    description = Column(String)
    grade = Column(String)
    price = Column(Float)
    uom = Column(String)
    annual_quantity = Column(Float, nullable=True)

class CategoryWorkbook(Base):
    __tablename__ = "categoryworkbook"
    id = Column(Integer, primary_key=True, index=True)
    workbook_id = Column(String, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    description = Column(String)
    owner = Column(String)
    status = Column(String)

class CategoryWorkbookSection(Base):
    __tablename__ = "categoryworkbooksection"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(String, unique=True, index=True)
    workbook_id = Column(String, ForeignKey("categoryworkbook.workbook_id"), nullable=True)
    section_number = Column(Integer)
    section_name = Column(String)
    content = Column(String)


class MasterContractClause(Base):
    __tablename__ = "mastercontractclause"
    id = Column(Integer, primary_key=True, index=True)
    clause_id = Column(String, unique=True, index=True)  # e.g. MCC_001
    clause_type = Column(String)
    clause_name = Column(String)
    description = Column(String)
    standard_language = Column(String)
    applicability = Column(String)
    risk_level = Column(String)
    is_mandatory = Column(String)

class CategoryStrategy(Base):
    __tablename__ = "category_strategy"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("category.id"))
    content = Column(String)  # Can be a JSON string of bullet points or blocks
    owner = Column(String)
    next_review_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category")
    changes = relationship("CategoryStrategyChange", back_populates="strategy")

class CategoryStrategyChange(Base):
    __tablename__ = "category_strategy_changes"
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("category_strategy.id"))
    change_description = Column(String)
    changed_by = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    strategy = relationship("CategoryStrategy", back_populates="changes")

