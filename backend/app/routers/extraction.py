import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Study, Extraction, TextChunk, Project, User
from app.schemas import ExtractionOut, ExtractionUpdateRequest
from app.utils.auth import get_current_user
from app.services.claude_service import extract_from_chunks, validate_extraction

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/extraction", tags=["extraction"])


@router.post("/extract/{study_id}", response_model=ExtractionOut)
def run_extraction(
    study_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id, Project.user_id == current_user.id
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    if not study.raw_text:
        raise HTTPException(status_code=400, detail="No text extracted from this study")

    chunks = db.query(TextChunk).filter(
        TextChunk.study_id == study_id
    ).order_by(TextChunk.chunk_index).all()

    if not chunks:
        raise HTTPException(status_code=400, detail="No text chunks found. Re-upload the study.")

    chunk_dicts = [{"chunk_index": c.chunk_index, "content": c.content} for c in chunks]

    try:
        study.status = "processing"
        db.commit()

        extracted_data, raw_response = extract_from_chunks(chunk_dicts)
        confidence, issues = validate_extraction(extracted_data, study.raw_text[:6000])

        existing = db.query(Extraction).filter(Extraction.study_id == study_id).first()
        if existing:
            existing.json_data = extracted_data
            existing.confidence_score = confidence
            existing.validation_issues = issues
            existing.raw_claude_response = raw_response
            extraction = existing
        else:
            extraction = Extraction(
                id=str(uuid.uuid4()),
                study_id=study_id,
                json_data=extracted_data,
                confidence_score=confidence,
                validation_issues=issues,
                raw_claude_response=raw_response,
            )
            db.add(extraction)

        study.status = "extracted"
        db.commit()
        db.refresh(extraction)
        return ExtractionOut.model_validate(extraction)

    except Exception as e:
        logger.error(f"Extraction failed for study {study_id}: {e}")
        study.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@router.get("/{study_id}", response_model=ExtractionOut)
def get_extraction(
    study_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id, Project.user_id == current_user.id
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    extraction = db.query(Extraction).filter(Extraction.study_id == study_id).first()
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction found for this study")

    return ExtractionOut.model_validate(extraction)


@router.put("/{study_id}", response_model=ExtractionOut)
def update_extraction(
    study_id: str,
    payload: ExtractionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    study = db.query(Study).join(Project).filter(
        Study.id == study_id, Project.user_id == current_user.id
    ).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    extraction = db.query(Extraction).filter(Extraction.study_id == study_id).first()
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction found")

    extraction.json_data = payload.json_data.model_dump()
    db.commit()
    db.refresh(extraction)
    return ExtractionOut.model_validate(extraction)
