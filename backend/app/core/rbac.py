from backend.app.db.models import UserRole

# Full 5-role permission map
# Access levels: Full (view + act), View (read-only), None (hidden)
ROLE_PERMISSIONS = {
    UserRole.CPO: ["*"],  # Full access across all modules
    UserRole.CATEGORY_MANAGER: [
        "category:read", "category:write",
        "pr:read", "pr:write",
        "vendor:read",
    ],
    UserRole.ANALYST: [
        "pr:read", "pr:write",
        "category:read",      # View-only
        "vendor:read",        # View-only
    ],
    UserRole.REQUESTER: [
        "pr:own_read",        # Only own PRs
        "pr:own_write",
    ],
    UserRole.SRM: [
        "vendor:read", "vendor:write",
        "performance:read",
    ],
}

# Copilot query scope per role — controls which AI pipelines can be routed
ROLE_COPILOT_SCOPE = {
    UserRole.CPO: ["pr", "vendor", "category"],
    UserRole.CATEGORY_MANAGER: ["pr", "vendor", "category"],
    UserRole.ANALYST: ["pr", "vendor", "category"],
    UserRole.REQUESTER: ["pr_own"],     # Only own-PR queries
    UserRole.SRM: ["vendor"],           # Vendor/supplier queries only
}

# Human-readable role labels for display
ROLE_LABELS = {
    UserRole.CPO: "Chief Procurement Officer",
    UserRole.CATEGORY_MANAGER: "Category Manager",
    UserRole.ANALYST: "Sourcing Analyst",
    UserRole.REQUESTER: "PR Requester",
    UserRole.SRM: "Supplier Relationship Manager",
}

# Copilot placeholder text per role
ROLE_COPILOT_PLACEHOLDER = {
    UserRole.CPO: "Ask about any PRs, Vendors, Spend, or Category strategies...",
    UserRole.CATEGORY_MANAGER: "Ask about category spend, PR issues, or vendor performance...",
    UserRole.ANALYST: "Ask about PR trends, bottlenecks, or savings opportunities...",
    UserRole.REQUESTER: "Ask about the status or timeline of your own PRs...",
    UserRole.SRM: "Ask about vendor performance, risk scores, or ESG ratings...",
}


def has_permission(user_role: str, action: str) -> bool:
    permissions = ROLE_PERMISSIONS.get(user_role, [])
    if "*" in permissions:
        return True
    return action in permissions


def get_copilot_scope(user_role: str) -> list:
    """Return list of pipeline types the user role is allowed to trigger."""
    return ROLE_COPILOT_SCOPE.get(user_role, [])


def filter_pr_by_role(user, query):
    """
    Apply RBAC filtering to PR queries.
    - REQUESTER: Only own PRs
    - Others: Full access (or filtered by category if needed)
    """
    if user.role == UserRole.REQUESTER:
        return query.filter_by(requester_id=user.id)
    return query
