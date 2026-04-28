from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="projects")
    studies = relationship("Study", back_populates="project", cascade="all, delete-orphan")


class Study(Base):
    __tablename__ = "studies"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    page_count = Column(Integer, nullable=True)
    status = Column(String, default="uploaded")  # uploaded | processing | extracted | error
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="studies")
    chunks = relationship("TextChunk", back_populates="study", cascade="all, delete-orphan")
    extraction = relationship("Extraction", back_populates="study", uselist=False, cascade="all, delete-orphan")


class TextChunk(Base):
    __tablename__ = "text_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    study_id = Column(String, ForeignKey("studies.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)

    study = relationship("Study", back_populates="chunks")


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(String, primary_key=True, default=generate_uuid)
    study_id = Column(String, ForeignKey("studies.id", ondelete="CASCADE"), nullable=False, unique=True)
    json_data = Column(JSONB, nullable=True)
    confidence_score = Column(Float, nullable=True)
    validation_issues = Column(JSONB, nullable=True)
    raw_claude_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    study = relationship("Study", back_populates="extraction")
