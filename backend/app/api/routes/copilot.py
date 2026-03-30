from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.api import deps
from backend.agents.orchestrator import AgentOrchestrator # Reusing the agent logic
from pydantic import BaseModel

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class QueryBody(BaseModel):
    query: str
    context: dict | None = None

@router.post("/query")
def copilot_query(body: QueryBody, user=Depends(deps.get_current_user), db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(db, user)
    return orchestrator.run_query(body.query, body.context)
