from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth import get_current_user
from backend.agents.orchestrator import AgentOrchestrator
from pydantic import BaseModel

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class QueryBody(BaseModel):
    query: str

@router.post("/query")
def copilot_query(body: QueryBody, user=Depends(get_current_user), db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(db, user)
    response = orchestrator.run_query(body.query)
    return response
