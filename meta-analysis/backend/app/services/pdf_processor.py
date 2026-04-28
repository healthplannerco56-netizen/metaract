import fitz  # PyMuPDF
import pdfplumber
import pytesseract
from PIL import Image
import io
import logging
from typing import Tuple

logger = logging.getLogger(__name__)


def extract_text_pymupdf(file_path: str) -> Tuple[str, int]:
    """Primary extraction with PyMuPDF."""
    doc = fitz.open(file_path)
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text("text"))
    doc.close()
    return "\n".join(text_parts), len(text_parts)


def extract_text_pdfplumber(file_path: str) -> str:
    """Fallback extraction with pdfplumber (better for tables)."""
    parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
            # Also extract tables
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row:
                        parts.append("\t".join(str(cell or "") for cell in row))
    return "\n".join(parts)


def extract_text_ocr(file_path: str) -> str:
    """OCR fallback using Tesseract for scanned PDFs."""
    doc = fitz.open(file_path)
    text_parts = []
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_string(img)
        text_parts.append(text)
    doc.close()
    return "\n".join(text_parts)


def extract_text(file_path: str) -> Tuple[str, int]:
    """
    Extract text from PDF with fallback chain:
    PyMuPDF → pdfplumber → Tesseract OCR
    Returns (text, page_count)
    """
    try:
        text, page_count = extract_text_pymupdf(file_path)
        if len(text.strip()) > 100:
            logger.info(f"PyMuPDF extraction succeeded: {len(text)} chars")
            return text, page_count
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}")

    try:
        text = extract_text_pdfplumber(file_path)
        if len(text.strip()) > 100:
            logger.info(f"pdfplumber extraction succeeded: {len(text)} chars")
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
            return text, page_count
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}")

    try:
        logger.info("Falling back to Tesseract OCR")
        text = extract_text_ocr(file_path)
        doc = fitz.open(file_path)
        page_count = len(doc)
        doc.close()
        return text, page_count
    except Exception as e:
        logger.error(f"OCR fallback failed: {e}")
        return "", 0
