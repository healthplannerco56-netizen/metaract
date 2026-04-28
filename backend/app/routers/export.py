from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, Study, Extraction, User
from app.utils.auth import get_current_user
from app.utils.csv_export import generate_csv

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/{project_id}")
def export_project_csv(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    studies = db.query(Study).filter(Study.project_id == project_id).all()
    pairs = []
    for study in studies:
        extraction = db.query(Extraction).filter(Extraction.study_id == study.id).first()
        if extraction:
            pairs.append((study, extraction))

    if not pairs:
        raise HTTPException(status_code=404, detail="No extracted data found in this project")

    csv_content = generate_csv(pairs)
    safe_name = project.name.replace(" ", "_").lower()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_export.csv"'},
    )
