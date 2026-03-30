# PROCURA | Procurement Intelligence Platform (P•I•P)

A modern, AI-driven procurement intelligence platform for strategic sourcing, transaction tracking, and vendor governance.

## Platform Structure

Procura is organized into three functional modules sharing global components such as the KPI Bar, Filters, Notifications, and the Always-On Copilot.

### 1. Category Module
Category insights and category strategy management (spend, market intelligence, insights, and strategy workspace).
*   **Primary Users**: CPO, Procurement Category Manager.

### 2. Transaction Module (PR → PO)
End-to-end tracking of the Purchase Requisition (PR) to Purchase Order (PO) cycle (bottlenecks, aging, pending-with, cycle time).
*   **Primary Users**: Sourcing Analyst, Procurement Category Manager, PR Requester (limited).

### 3. Vendor Module
Supplier profile, performance, risk/ESG, comparisons, and relationship governance.
*   **Primary Users**: Supplier Relationship Manager, Procurement Category Manager, CPO.

## Tech Stack
- **Frontend**: React + Vite + Vanilla CSS (Premium SaaS UI)
- **Backend**: Python (FastAPI/SQLModel)
- **AI Core**: LLM-driven Copilot (Gemini)
- **Database**: SQL backend (SQLite for dev)

## Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+

### Local Development
1. **Frontend**: `cd frontend && npm install && npm run dev`
2. **Backend**: `cd backend && pip install -r requirements.txt && python main.py`

