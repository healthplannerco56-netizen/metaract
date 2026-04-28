import csv
import io
from typing import List
from app.models import Extraction, Study


def flatten_extraction(study: Study, extraction: Extraction) -> List[dict]:
    """Flatten a single extraction into one row per outcome."""
    data = extraction.json_data or {}
    rows = []

    base = {
        "study_db_id": study.id,
        "file_name": study.file_name,
        "study_id": data.get("study_id", ""),
        "study_design": data.get("study_design", ""),
        "sample_intervention": data.get("sample_size", {}).get("intervention", ""),
        "sample_control": data.get("sample_size", {}).get("control", ""),
        "sample_total": data.get("sample_size", {}).get("total", ""),
        "condition": data.get("population", {}).get("condition", ""),
        "age_mean": data.get("population", {}).get("age_mean", ""),
        "intervention": data.get("intervention", ""),
        "comparator": data.get("comparator", ""),
        "confidence_score": extraction.confidence_score or "",
    }

    outcomes = data.get("outcomes", [])
    if not outcomes:
        rows.append({**base, "outcome_name": "", "effect_measure": "",
                     "effect_value": "", "confidence_interval": "", "p_value": ""})
    else:
        for outcome in outcomes:
            rows.append({
                **base,
                "outcome_name": outcome.get("name", ""),
                "effect_measure": outcome.get("effect_measure", ""),
                "effect_value": outcome.get("effect_value", ""),
                "confidence_interval": outcome.get("confidence_interval", ""),
                "p_value": outcome.get("p_value", ""),
            })

    return rows


def generate_csv(studies_extractions: List[tuple]) -> str:
    """Generate CSV string from list of (study, extraction) tuples."""
    all_rows = []
    for study, extraction in studies_extractions:
        all_rows.extend(flatten_extraction(study, extraction))

    if not all_rows:
        return ""

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(all_rows[0].keys()))
    writer.writeheader()
    writer.writerows(all_rows)
    return output.getvalue()
