from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Study, Project, User
from app.utils.auth import get_current_user
from app.schemas import StudyOut
from pydantic import BaseModel


class StudyDetailOut(StudyOut):
    raw_text: Optional[str] = None

    class Config:
        from_attributes = True


router = APIRouter(prefix="/study-detail", tags=["study-detail"])


@router.get("/{study_id}", response_model=StudyDetailOut)
def get_study_detail(
    study_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id,
        Project.user_id == current_user.id,
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return StudyDetailOut.model_validate(study)
