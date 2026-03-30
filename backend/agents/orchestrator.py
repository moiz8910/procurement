import time
import random
import json
import google.generativeai as genai
from backend.app.db.models import (
    PurchaseRequisition, Vendor, Category, VendorPerformance, UserRole,
    MarketIntelligence, VendorDiscovery, SavingsTracker
)
from backend.app.core.rbac import get_copilot_scope
from backend.app.services.data_rag_service import DataRAGService


GEMINI_API_KEY = "AIzaSyBBLDkLERTlTmcATSbGuGnckUJS9dpW_9o"
AI_MODEL = "gemini-2.5-flash"

genai.configure(api_key=GEMINI_API_KEY)


def _safe_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    try:
        # Strip markdown code fences if present
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        return json.loads(cleaned.strip())
    except Exception:
        return {
            "answer": text.strip(),
            "insights": [],
            "actions": [],
            "confidence": 0.7
        }


class AgentOrchestrator:
    def __init__(self, db, user):
        self.db = db
        self.user = user
        self.model = genai.GenerativeModel(AI_MODEL)

    def log_step(self, step, message):
        print(f"[{step}] {message}")
        time.sleep(random.uniform(0.05, 0.15))

    def _get_pr_context(self):
        """Fetch PR context, filtered by role."""
        query = self.db.query(PurchaseRequisition)
        if self.user.role == UserRole.REQUESTER:
            query = query.filter(PurchaseRequisition.requester_id == self.user.id)
        prs = query.limit(20).all()
        rows = []
        for pr in prs:
            rows.append(
                f"PR#{pr.id} | Status:{pr.status} | Amount:${pr.amount:.0f} | SLA:{pr.sla_days}d | Owner:{pr.current_owner}"
            )
        return "\n".join(rows) if rows else "No PRs available for your scope."

    def _get_vendor_context(self):
        """Fetch vendor context. Blocked for REQUESTER."""
        if self.user.role == UserRole.REQUESTER:
            return None  # No vendor data access
        vendors = self.db.query(Vendor).limit(20).all()
        rows = []
        for v in vendors:
            perf = self.db.query(VendorPerformance).filter(VendorPerformance.vendor_id == v.id).first()
            delivery = round(perf.delivery_score, 2) if perf else "N/A"
            rows.append(
                f"Vendor:{v.name} | Risk:{round(v.risk_score,2)} | ESG:{round(v.esg_score,2)} | Delivery:{delivery}"
            )
        return "\n".join(rows)

    def _get_category_context(self):
        """Deprecated: Use DataRAGService."""
        pass


    def _get_market_context(self):
        """Fetch market intelligence benchmark data."""
        if self.user.role in (UserRole.REQUESTER, UserRole.SRM):
            return None
        mi_data = self.db.query(MarketIntelligence).limit(10).all()
        rows = []
        for mi in mi_data:
            rows.append(f"{mi.category_name} | Commodity:{mi.commodity} | Price:{mi.current_price}{mi.price_unit} | Trend:{mi.trend} | Forecast:{mi.forecast_6m}")
        return "\n".join(rows)

    def _get_discovery_context(self):
        """Fetch scouted vendors/capabilities."""
        if self.user.role in (UserRole.REQUESTER):
            return None
        discovery = self.db.query(VendorDiscovery).limit(10).all()
        rows = []
        for vd in discovery:
            rows.append(f"Scouted Vendor:{vd.vendor_name} | Cat:{vd.category_name} | Capabilities:{vd.capabilities}")
        return "\n".join(rows)


    def run_query(self, query: str, context_data: dict | None = None):
        print(f"\n--- Starting AI Orchestration for: '{query}' ---")

        self.log_step(1, "Fetching context data from DB...")
        self.log_step(2, f"Applying RBAC filters for role: {self.user.role}")

        # Format user context for prompt
        ctx_str = "None provided"
        if context_data:
            ctx_str = f"Active Module: {context_data.get('module', 'Unknown')}\nFilters: {context_data.get('filters', {})}"

        allowed_scopes = get_copilot_scope(self.user.role)
        q = query.upper()

        import re
        def match_keywords(text: str, kws: list) -> bool:
            return any(re.search(r'\b' + kw + r'\b', text, re.IGNORECASE) for kw in kws)

        if match_keywords(query, ["PR", "PRS", "DELAY", "APPROVAL", "REQUISITION", "BOTTLENECK"]):
            # PR pipeline — allowed for all roles (REQUESTER limited to own)
            if "pr" in allowed_scopes or "pr_own" in allowed_scopes:
                return self.run_pr_bottleneck_pipeline(query, ctx_str)
            return self._access_denied_response("PR analytics")

        elif match_keywords(query, ["VENDOR", "RISK", "ESG", "DELIVERY", "SUPPLIER"]):
            if "vendor" in allowed_scopes:
                return self.run_vendor_risk_pipeline(query, ctx_str)
            return self._access_denied_response("Vendor/Supplier intelligence")

        elif match_keywords(query, ["SPEND", "CATEGORY", "COMMODITY", "TREND", "MARKET", "STRATEGY", "PLAYBOOK", "OPTIMIZATION", "ALUMINA", "COAL"]):
            if "category" in allowed_scopes:
                return self.run_category_intelligence_pipeline(query, ctx_str)
            return self._access_denied_response("Category strategy intelligence")

        elif match_keywords(query, ["MCC", "CLAUSE", "CONTRACT", "MASTER CLAUSE"]):
            if "category" in allowed_scopes or "vendor" in allowed_scopes:
                return self.run_contract_clause_pipeline(query, ctx_str)
            return self._access_denied_response("Contract clause intelligence")
        
        else:
            # Safest default fallback if all else fails but they have category access
            if "category" in allowed_scopes:
                return self.run_category_intelligence_pipeline(query, ctx_str)
            return self._access_denied_response("General intelligence")

    def _access_denied_response(self, topic: str) -> dict:
        """Return a polite access-denied message when a query is out of scope."""
        return {
            "answer": f"You do not have permission to query {topic} data. Your access is limited to your assigned role's scope.",
            "insights": [],
            "actions": [],
            "confidence": 1.0
        }

    def _build_strict_prompt(self, query: str, context: dict, ctx_str: str) -> str:
        return f"""You are Procura AI, an elite Enterprise Procurement Intelligence Copilot.
You MUST answer the user's query STRICTLY and EXCLUSIVELY based on the provided JSON Context Data.
CRITICAL RULE: DO NOT hallucinate external knowledge. If the user asks a question (e.g. general knowledge, "what is AI", programming help) that is NOT explicitly answered or directly supported by the Context Data, you MUST refuse to answer and state: "I do not have enough specific information in your organization's procurement data to answer that."

User Query: "{query}"

Context Data:
{json.dumps(context, indent=2)}

Interface State: {ctx_str}

You MUST return your response as RAW JSON exactly matching this schema (NO markdown fences, NO extra text):
{{
  "answer": "Your detailed, context-bounded answer here. Refuse if out of scope.",
  "insights": ["Insight 1", "Insight 2"],
  "actions": [{{"label": "Suggested Action"}}],
  "deep_links": [{{"label": "View Dashboard", "target": "category-intelligence"}}],
  "confidence": 0.9
}}"""

    def run_pr_bottleneck_pipeline(self, query: str, ctx_str: str):
        self.log_step(3, "Running PR Bottleneck Agent...")
        context = DataRAGService.get_transaction_bottleneck_context(self.db, self.user, query)
        
        prompt = self._build_strict_prompt(query, context, ctx_str)
        self.log_step(5, "Calling Gemini to generate actionable insights...")
        try:
            response = self.model.generate_content(prompt)
            result = _safe_json(response.text)
            print(f"[AI] PR Bottleneck analysis complete. Confidence: {result.get('confidence', '?')}")
            return result
        except Exception as e:
            print(f"[AI Error] {e}")
            return {"answer": "I am currently unable to process your request due to AI service capacity limits. Please try again later.", "insights": ["System Rate Limited"], "actions": [], "confidence": 0}

    def run_vendor_risk_pipeline(self, query: str, ctx_str: str):
        self.log_step(3, "Running Vendor Risk Agent...")
        context = DataRAGService.get_vendor_risk_context(self.db, 1) # Sample ID 1
        
        prompt = self._build_strict_prompt(query, context, ctx_str)
        self.log_step(5, "Calling Gemini to assess vendor risk landscape...")
        try:
            response = self.model.generate_content(prompt)
            return _safe_json(response.text)
        except Exception as e:
            print(f"[AI Error] {e}")
            return {"answer": "I am currently unable to process your request due to AI service capacity limits. Please try again later.", "insights": ["System Rate Limited"], "actions": [], "confidence": 0}

    def run_category_intelligence_pipeline(self, query: str, ctx_str: str):
        self.log_step(3, "Running Category Intelligence Agent...")
        context = DataRAGService.get_category_intelligence_context(self.db, 1) # Sample ID 1
        
        prompt = self._build_strict_prompt(query, context, ctx_str)
        self.log_step(5, "Calling Gemini to identify savings opportunities...")
        try:
            response = self.model.generate_content(prompt)
            return _safe_json(response.text)
        except Exception as e:
            print(f"[AI Error] {e}")
            return {"answer": "I am currently unable to process your request due to AI service capacity limits. Please try again later.", "insights": ["System Rate Limited"], "actions": [], "confidence": 0}

    def run_contract_clause_pipeline(self, query: str, ctx_str: str):
        self.log_step(3, "Running Contract Clause Agent...")
        context = DataRAGService.get_contract_clause_context(self.db, query)
        
        prompt = self._build_strict_prompt(query, context, ctx_str)
        self.log_step(5, "Calling Gemini to retrieve contract clause details...")
        try:
            response = self.model.generate_content(prompt)
            return _safe_json(response.text)
        except Exception as e:
            print(f"[AI Error] {e}")
            return {"answer": "I am currently unable to process your request due to AI service capacity limits. Please try again later.", "insights": [], "actions": [], "confidence": 0}

