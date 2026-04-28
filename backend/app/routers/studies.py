import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Project, Study, TextChunk, User
from app.schemas import StudyOut
from app.utils.auth import get_current_user
from app.services.pdf_processor import extract_text
from app.services.chunking import chunk_text
from app.config import settings
import aiofiles

logger = logging.getLogger(__name__)
router = APIRouter(tags=["studies"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/upload/{project_id}", response_model=StudyOut, status_code=201)
async def upload_study(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

    safe_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    study = Study(
        id=str(uuid.uuid4()),
        project_id=project_id,
        file_name=file.filename,
        file_path=file_path,
        status="processing",
    )
    db.add(study)
    db.commit()

    try:
        raw_text, page_count = extract_text(file_path)
        study.raw_text = raw_text
        study.page_count = page_count

        chunks = chunk_text(raw_text)
        for c in chunks:
            db.add(TextChunk(
                id=str(uuid.uuid4()),
                study_id=study.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                token_count=c["token_count"],
            ))

        study.status = "uploaded"
        db.commit()
        db.refresh(study)
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        study.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")

    return StudyOut.model_validate(study)


@router.get("/studies/{project_id}", response_model=List[StudyOut])
def list_studies(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    studies = db.query(Study).filter(Study.project_id == project_id).order_by(Study.created_at.desc()).all()
    return [StudyOut.model_validate(s) for s in studies]


@router.get("/study/{study_id}", response_model=StudyOut)
def get_study(
    study_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id, Project.user_id == current_user.id
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return StudyOut.model_validate(study)


@router.delete("/study/{study_id}", status_code=204)
def delete_study(
    study_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id, Project.user_id == current_user.id
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    if study.file_path and os.path.exists(study.file_path):
        os.remove(study.file_path)
    db.delete(study)
    db.commit()
