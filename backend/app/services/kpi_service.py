import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.models import PurchaseRequisition, Vendor, Category

# Threshold definitions: if value exceeds these, flag as warning/critical
KPI_THRESHOLDS = {
    "delayed_percentage": {"warning": 20, "critical": 35},
    "risky_vendors": {"warning": 10, "critical": 25},
    "avg_cycle_time": {"warning": 7, "critical": 14},
}

def _get_threshold_status(key: str, value: float) -> str:
    """Return 'ok', 'warning', or 'critical' for a given KPI value."""
    thresholds = KPI_THRESHOLDS.get(key)
    if not thresholds:
        return "ok"
    if value >= thresholds["critical"]:
        return "critical"
    if value >= thresholds["warning"]:
        return "warning"
    return "ok"


class KPIService:
    @staticmethod
    def _build_base_query(db, time_range, category_id, requester_id, days_offset=0):
        """Build a filtered PR query with optional offset for prior-period."""
        q = db.query(PurchaseRequisition)
        if requester_id:
            q = q.filter(PurchaseRequisition.requester_id == requester_id)
        if category_id:
            q = q.filter(PurchaseRequisition.category_id == category_id)

        now = datetime.datetime.now() - datetime.timedelta(days=days_offset)
        if time_range == "7d":
            q = q.filter(PurchaseRequisition.created_at >= now - datetime.timedelta(days=7))
        elif time_range == "30d":
            q = q.filter(PurchaseRequisition.created_at >= now - datetime.timedelta(days=30))
        elif time_range == "90d":
            q = q.filter(PurchaseRequisition.created_at >= now - datetime.timedelta(days=90))
        return q

    @staticmethod
    def _compute_metrics(db, query, category_id, requester_id):
        """Compute core aggregations from a query."""
        total_prs = query.count()
        total_spend = query.with_entities(func.sum(PurchaseRequisition.amount)).scalar() or 0
        pending_prs = query.filter(PurchaseRequisition.status != "PO_CREATED").count()

        risky_vendors = 0
        if not requester_id:
            vendor_query = db.query(Vendor)
            if category_id:
                vendor_query = vendor_query.filter(Vendor.category_id == category_id)
            risky_vendors = vendor_query.filter(Vendor.risk_score > 0.7).count()

        delayed_pct = round((pending_prs / total_prs * 100), 1) if total_prs > 0 else 0
        return {
            "total_prs": total_prs,
            "pending_prs": pending_prs,
            "total_spend": round(total_spend, 2),
            "risky_vendors": risky_vendors,
            "avg_cycle_time": 5.4,  # Mocked; replace with real avg once PREvent data is reliable
            "delayed_percentage": delayed_pct,
        }

    @staticmethod
    def _delta(current, prior):
        """Compute % change from prior to current, returns signed float."""
        if prior == 0:
            return 0.0
        return round(((current - prior) / prior) * 100, 1)

    @staticmethod
    def get_filtered_kpis(db: Session, time_range: str = None, category_id: int = None, vendor_id: int = None, requester_id: int = None):
        print(f"[KPI] Computing metrics: Time={time_range}, Cat={category_id}, Ven={vendor_id}, Requester={requester_id}")

        # Current period
        days = {"7d": 7, "30d": 30, "90d": 90}.get(time_range, 30)
        current_q = KPIService._build_base_query(db, time_range, category_id, requester_id, days_offset=0)
        current = KPIService._compute_metrics(db, current_q, category_id, requester_id)

        # Prior period (shifted back by the same window)
        prior_q = KPIService._build_base_query(db, time_range, category_id, requester_id, days_offset=days)
        prior = KPIService._compute_metrics(db, prior_q, category_id, requester_id)

        # Trend deltas (% change vs prior period)
        trends = {
            "total_prs": KPIService._delta(current["total_prs"], prior["total_prs"]),
            "pending_prs": KPIService._delta(current["pending_prs"], prior["pending_prs"]),
            "total_spend": KPIService._delta(current["total_spend"], prior["total_spend"]),
            "risky_vendors": KPIService._delta(current["risky_vendors"], prior["risky_vendors"]),
            "delayed_percentage": KPIService._delta(current["delayed_percentage"], prior["delayed_percentage"]),
            "avg_cycle_time": KPIService._delta(current["avg_cycle_time"], prior["avg_cycle_time"]),
        }

        # Threshold statuses
        thresholds = {k: _get_threshold_status(k, v) for k, v in current.items()}

        return {**current, "trends": trends, "thresholds": thresholds}
