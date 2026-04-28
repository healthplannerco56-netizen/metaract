import json
import logging
import anthropic
from typing import Tuple, Optional
from app.config import settings

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

EXTRACTION_SYSTEM = """You are a clinical research data extraction engine. Extract only explicit data found in the text. Return strict JSON and nothing else. Do not infer or fabricate data. If a value is not present, use null or empty string."""

EXTRACTION_PROMPT_TEMPLATE = """Extract clinical trial data from the following research text and return a JSON object matching this exact schema:

{{
  "study_id": "",
  "study_design": "",
  "sample_size": {{
    "intervention": null,
    "control": null,
    "total": null
  }},
  "population": {{
    "condition": "",
    "age_mean": null
  }},
  "intervention": "",
  "comparator": "",
  "outcomes": [
    {{
      "name": "",
      "effect_measure": "",
      "effect_value": "",
      "confidence_interval": "",
      "p_value": ""
    }}
  ]
}}

Research text:
{text}

Return ONLY valid JSON. No explanation, no markdown, no preamble."""

VALIDATION_SYSTEM = """You are a clinical research data validation engine. Your job is to verify extracted JSON data against the source text. Return strict JSON only."""

VALIDATION_PROMPT_TEMPLATE = """You are validating extracted clinical data against the original research text.

Original text (excerpt):
{text}

Extracted JSON:
{extracted_json}

Evaluate the accuracy of each extracted field. Return a JSON object with this exact schema:
{{
  "confidence_score": 0.0,
  "issues": []
}}

Where:
- confidence_score is a float from 0.0 to 1.0 (1.0 = perfectly accurate)
- issues is a list of strings describing any inaccuracies or missing data

Return ONLY valid JSON. No explanation, no markdown."""


def call_claude(prompt: str, system: str, max_retries: int = 2) -> str:
    """Call Claude API with retry logic. Returns raw text response."""
    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=4096,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        except anthropic.APIError as e:
            last_error = e
            logger.warning(f"Claude API error (attempt {attempt + 1}): {e}")
        except Exception as e:
            last_error = e
            logger.error(f"Unexpected error (attempt {attempt + 1}): {e}")

    raise RuntimeError(f"Claude API failed after {max_retries + 1} attempts: {last_error}")


def parse_json_response(raw: str) -> dict:
    """Parse JSON from Claude response, stripping markdown fences if present."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
    return json.loads(cleaned)


def extract_from_chunks(chunks: list) -> Tuple[dict, str]:
    """
    Run extraction across all chunks and merge results.
    Returns (merged_data, raw_response_of_best_chunk).
    """
    best_data = None
    best_raw = ""
    best_outcome_count = -1

    for chunk in chunks:
        prompt = EXTRACTION_PROMPT_TEMPLATE.format(text=chunk["content"])
        try:
            raw = call_claude(prompt, EXTRACTION_SYSTEM)
            data = parse_json_response(raw)
        except (json.JSONDecodeError, RuntimeError) as e:
            logger.warning(f"Chunk {chunk['chunk_index']} extraction failed: {e}")
            # Re-prompt once for invalid JSON
            try:
                retry_prompt = prompt + "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the JSON object, nothing else."
                raw = call_claude(retry_prompt, EXTRACTION_SYSTEM)
                data = parse_json_response(raw)
            except Exception:
                continue

        outcome_count = len(data.get("outcomes", []))
        if best_data is None or outcome_count > best_outcome_count:
            best_data = data
            best_raw = raw
            best_outcome_count = outcome_count

    if best_data is None:
        raise RuntimeError("Extraction failed on all chunks")

    return best_data, best_raw


def validate_extraction(extracted_data: dict, text_sample: str) -> Tuple[float, list]:
    """
    Validate extracted JSON against source text.
    Returns (confidence_score, issues_list).
    """
    prompt = VALIDATION_PROMPT_TEMPLATE.format(
        text=text_sample[:6000],
        extracted_json=json.dumps(extracted_data, indent=2),
    )
    try:
        raw = call_claude(prompt, VALIDATION_SYSTEM)
        result = parse_json_response(raw)
        score = float(result.get("confidence_score", 0.5))
        issues = result.get("issues", [])
        return score, issues
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        return 0.5, [f"Validation could not be completed: {str(e)}"]
