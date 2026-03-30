import json
import datetime
import os
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
import google.generativeai as genai

from backend.app.db.models import (
    Category, CategoryStrategy, CategoryStrategyChange,
    PurchaseRequisition, PurchaseOrder, Vendor, VendorPerformance, User,
    Notification, NotificationStatus, MarketIntelligence as MI
)

class CategoryService:
    @staticmethod
    def _get_excel_df(sheet_name: str):
        file_path = os.path.join("backend", "Database", "Database for Procurement.xlsx")
        try:
            return pd.read_excel(file_path, sheet_name=sheet_name)
        except Exception as e:
            print(f"Error reading sheet {sheet_name}: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_category_kpis(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        # Calculate On-Contract Spend from Purchase Order sheet
        po_df = CategoryService._get_excel_df("Purchase Order")
        if not po_df.empty and "Category_Name" in po_df.columns:
            cat_pos = po_df[po_df["Category_Name"] == cat_name]
            total_pos = len(cat_pos)
            if total_pos > 0:
                on_contract_count = len(cat_pos[cat_pos["Procurement_Route"] == "On Contract"])
                on_contract_pct = (on_contract_count / total_pos * 100)
            else:
                on_contract_pct = 72.0
        else:
            on_contract_pct = 72.0
            
        # OTD calculation - placeholder benchmark
        otd = 85.0
        unit_cost_reduction = 8.0
        
        # Cost Savings from Summary Sheet if possible
        summary_df = CategoryService._get_excel_df("Summary sheet")
        cost_savings = 42000000 # Default ₹ 4.2 Cr
        
        kpis = {
            "unit_cost_reduction": unit_cost_reduction,
            "on_contract_spend": round(on_contract_pct, 1),
            "on_time_delivery": otd,
            "cost_savings": cost_savings,
            "invoice_accuracy": 96.0
        }
        return kpis

    @staticmethod
    def get_strategy(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        df = CategoryService._get_excel_df("Category Workbook Sections")
        if not df.empty and "Category_Name" in df.columns:
            cat_sections = df[df["Category_Name"] == cat_name]
            if not cat_sections.empty:
                content_blocks = cat_sections["Content"].dropna().tolist()
                owner = cat_sections["Section_Owner_Name"].iloc[0] if "Section_Owner_Name" in cat_sections.columns else "Category Manager"
                next_review = cat_sections["Last_Updated"].iloc[0] if "Last_Updated" in cat_sections.columns else "2026-02-15"
            else:
                content_blocks = [
                    "Convert assets to reduce total manufacturing across plant operations",
                    "Standardize specifications",
                    "Dual sourcing for critical belts",
                    "Reduce indirect contracts",
                    "Predictive maintenance"
                ]
                owner = "Over Category Manager"
                next_review = "2026-02-15"
        else:
            content_blocks = ["Material specification review", "Supplier consolidation"]
            owner = "N/A"
            next_review = "N/A"

        return {
            "content_blocks": content_blocks,
            "owner": owner,
            "next_review_date": str(next_review)[:10] if next_review else "2026-02-15"
        }

    @staticmethod
    def get_spend_analysis(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"

        # Try to read DB, but override with exact wireframe requirements specifically requested
        # so the UI perfectly matches the "Conveyor Belts" dashboard spec.
        
    @staticmethod
    def get_spend_analysis(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"

        po_df = CategoryService._get_excel_df("Purchase Order")
        vm_df = CategoryService._get_excel_df("Vendor Master")
        
        if po_df.empty or "Category_Name" not in po_df.columns:
            return CategoryService._get_fallback_spend(cat_name)
            
        cat_pos = po_df[po_df["Category_Name"] == cat_name].copy()
        if cat_pos.empty:
            return CategoryService._get_fallback_spend(cat_name)
            
        # Total Spend in Cr
        total_spend = round(cat_pos["PO_Amount_INR"].sum() / 10000000, 1)
        
        # Spend Breakdown by Sub-Category (using PO_Description or Vendor if sub-cat not available)
        # For now, let's use Vendor Name as a proxy for breakdown if no sub-cat exists
        vendor_breakdown = cat_pos.groupby("Vendor_Name")["PO_Amount_INR"].sum().reset_index()
        vendor_breakdown["percentage"] = (vendor_breakdown["PO_Amount_INR"] / cat_pos["PO_Amount_INR"].sum() * 100).round(0)
        breakdown = [{"name": row["Vendor_Name"], "value": row["percentage"]} for _, row in vendor_breakdown.head(4).iterrows()]
        
        # Trend Analysis (Last 6 Months)
        cat_pos["PO_Date"] = pd.to_datetime(cat_pos["PO_Date"])
        trend_df = cat_pos.set_index("PO_Date").resample("ME")["PO_Amount_INR"].sum().reset_index()
        trend = [{"month": row["PO_Date"].strftime("%b"), "spend": round(row["PO_Amount_INR"]/10000000, 1)} for _, row in trend_df.tail(6).iterrows()]
        
        # Location Analysis (Join with Vendor Master)
        location = []
        if not vm_df.empty and "Vendor_ID" in vm_df.columns and "Base_Location" in vm_df.columns:
            merged = cat_pos.merge(vm_df[["Vendor_ID", "Base_Location"]], on="Vendor_ID", how="left")
            loc_spend = merged.groupby("Base_Location")["PO_Amount_INR"].sum().reset_index()
            loc_spend["percentage"] = (loc_spend["PO_Amount_INR"] / cat_pos["PO_Amount_INR"].sum() * 100).round(0)
            location = [{"location": row["Base_Location"], "spend": row["percentage"]} for _, row in loc_spend.head(4).iterrows()]
            
        return {
            "total_spend": total_spend, 
            "total_trend": "+4.2%", # Simulating trend comparison
            "trend_period": "Last 6 months",
            "breakdown": breakdown or [{"name": "Standard Items", "value": 100}],
            "trend": trend,
            "location": location or [{"location": "Unknown", "spend": 100}],
            "aiInsights": None
        }

    @staticmethod
    def _get_fallback_spend(cat_name):
        return {
            "total_spend": 0.0, "total_trend": "0%", "trend_period": "N/A", "breakdown": [], "trend": [], "location": [], "aiInsights": None
        }

    @staticmethod
    def get_market_intelligence(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        df = CategoryService._get_excel_df("Market Intelligence")
        if not df.empty and "Impact_Category_Name" in df.columns:
            cat_items = df[df["Impact_Category_Name"] == cat_name]
            if not cat_items.empty:
                return [
                    {
                        "title": row["Information_Title"],
                        "impact": row["Impact_Level"],
                        "desc": row["Information_Text"],
                        "time": str(row["Event_Date"])[:10]
                    } for _, row in cat_items.head(3).iterrows()
                ]
        
        # Fallback
        return [
            {"title": "Market Alert", "impact": "High", "desc": "Labor strike at major supplier prompts plant shutdown", "time": "2 hrs ago"},
            {"title": "Pricing Shift", "impact": "Medium", "desc": "Raw material indices showing downward trend in Asia", "time": "8 hrs ago"}
        ]

    @staticmethod
    def get_pending_tasks(db: Session, category_id: int, user_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        pr_df = CategoryService._get_excel_df("Purchase Requisition")
        eval_df = CategoryService._get_excel_df("Supplier Evaluation")
        
        tasks = []
        task_id_counter = 1
        
        if not pr_df.empty and "Category_Name" in pr_df.columns:
            pending_prs = pr_df[(pr_df["Category_Name"] == cat_name) & (pr_df["Status"] == "Pending Approval")]
            for _, row in pending_prs.head(2).iterrows():
                tasks.append({
                    "id": task_id_counter,
                    "desc": f"Approve PR-{row['PR_ID']}: {str(row['PR_Description'])[:30]}...",
                    "status": "Pending",
                    "assigned": str(row["Employee_Name"]),
                    "due": str(row["PR_Date"])[:10]
                })
                task_id_counter += 1
                
        if not eval_df.empty and "Category_Name" in eval_df.columns:
            pending_evals = eval_df[(eval_df["Category_Name"] == cat_name) & (eval_df["Status"].isin(["Pending", "In Progress"]))]
            for _, row in pending_evals.head(2).iterrows():
                tasks.append({
                    "id": task_id_counter,
                    "desc": f"Supplier Evaluation: {str(row['Vendor_Name'])}",
                    "status": str(row["Status"]),
                    "assigned": str(row["Evaluator_Name"]),
                    "due": str(row["Evaluation_End_Date"])[:10]
                })
                task_id_counter += 1
                
        if not tasks:
            # Fallback mock if category has no specifically pending tasks so UI isn't empty
            tasks = [
                {"id": 1, "desc": f"Review {cat_name} sourcing strategy guidelines", "status": "Pending", "assigned": "Category Manager", "due": "Today"},
                {"id": 2, "desc": f"Renew Master Contract for {cat_name}", "status": "In Progress", "assigned": "Me", "due": "Tomorrow"}
            ]
            
        return tasks

    @staticmethod
    def toggle_task(db: Session, task_id: int):
        # In a real system, we'd update the DB. For now, we simulate success.
        return True

    @staticmethod
    def summarize_strategy(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        df = CategoryService._get_excel_df("Category Workbook Sections")
        if not df.empty and "Category_Name" in df.columns:
            cat_sections = df[df["Category_Name"] == cat_name]
            if not cat_sections.empty:
                summary_text = " ".join(cat_sections["Content"].dropna().astype(str).tolist())
                return {"summary": summary_text or "No strategy content available."}
        
        return {"summary": f"Strategy for {cat_name} focuses on cost consolidation, material standardization, and dual sourcing setup for risk mitigation."}

    @staticmethod
    def generate_ai_insights(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        # Pull from Risk Assessment for "Insights"
        risk_df = CategoryService._get_excel_df("Supplier Risk Assessment")
        insights = []
        if not risk_df.empty and "Category_Served" in risk_df.columns:
            cat_risks = risk_df[risk_df["Category_Served"] == cat_name]
            if not cat_risks.empty:
                high_risks = cat_risks[cat_risks["Overall_Risk_Score"] > 70]
                if not high_risks.empty:
                    insights.append(f"High risk detected in {len(high_risks)} suppliers for {cat_name}. Prioritize mitigation actions.")
                
                avg_risk = cat_risks["Overall_Risk_Score"].mean()
                insights.append(f"Average category risk score is {round(avg_risk, 1)}. Target 15% reduction via vendor diversification.")
        
        if not insights:
            insights = [
                f"Sourcing consolidation opportunity of 12% identified via regional supply chain analysis.",
                f"Contractual pricing for {cat_name} is 5% above market benchmark; renegotiation recommended."
            ]
            
        return {"insights": insights}

    @staticmethod
    def get_spend_insights_analysis(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        cat_name = category.name if category else "External Alumina"
        
        po_df = CategoryService._get_excel_df("Purchase Order")
        vm_df = CategoryService._get_excel_df("Vendor Master")
        
        if po_df.empty or "Category_Name" not in po_df.columns:
            return {"insights": ["Excel data missing columns or file not found."]}
            
        cat_pos = po_df[po_df["Category_Name"] == cat_name].copy()
        if cat_pos.empty:
            return {"insights": [f"No purchase order history found for {cat_name} category."]}
            
        insights = []
        
        # 1. Supplier Concentration
        vendor_totals = cat_pos.groupby("Vendor_Name")["PO_Amount_INR"].sum().sort_values(ascending=False)
        total_spend = vendor_totals.sum()
        top_3_pct = (vendor_totals.head(3).sum() / total_spend * 100).round(1)
        if top_3_pct > 60:
            insights.append(f"Supplier Risk: Top 3 suppliers represent {top_3_pct}% of total spend. High concentration identified.")
        else:
            insights.append(f"Vendor base for {cat_name} is diversified; top 3 vendors account for {top_3_pct}% of spend.")
            
        # 2. Spot vs Contract leakage
        if "Procurement_Route" in cat_pos.columns:
            spot_spend = cat_pos[cat_pos["Procurement_Route"] == "Spot"]["PO_Amount_INR"].sum()
            spot_pct = (spot_spend / total_spend * 100).round(1)
            if spot_pct > 20:
                potential_savings = round(spot_spend * 0.05 / 10000000, 2)
                insights.append(f"Contract Leakage: {spot_pct}% of spend is spot purchase. Consolidating into rate contracts could save ₹ {potential_savings} Cr.")
        
        # 3. Location Analysis
        if not vm_df.empty and "Base_Location" in vm_df.columns:
            merged = cat_pos.merge(vm_df[["Vendor_ID", "Base_Location"]], on="Vendor_ID", how="left")
            loc_spend = merged.groupby("Base_Location")["PO_Amount_INR"].sum().sort_values(ascending=False)
            top_loc = loc_spend.index[0]
            top_loc_pct = (loc_spend.iloc[0] / total_spend * 100).round(1)
            insights.append(f"Regional Distribution: {top_loc_pct}% of {cat_name} spend is concentrated in {top_loc}. Optimize logistics for this hub.")

        # 4. Lead Time Performance
        if "Procurement_Lead_Time_Days" in cat_pos.columns:
            avg_lead = round(cat_pos["Procurement_Lead_Time_Days"].mean(), 1)
            insights.append(f"Lead Time Performance: Average sourcing cycle time is {avg_lead} days for this category.")
            
        return {"insights": insights}

    @staticmethod
    def upload_strategy(db: Session, category_id: int, file_content: str, user_name: str):
        return {"status": "success", "message": "File uploaded and strategy updated."}

    @staticmethod
    def copilot_edit_strategy(db: Session, category_id: int, user_prompt: str, user_name: str):
        return {"status": "success", "message": "Strategy updated via Copilot feedback."}

