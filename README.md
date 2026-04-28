# MetaLens — AI-Powered Meta-Analysis & Systematic Review Assistant

Upload research PDFs → Extract structured clinical data with Claude AI → Validate, edit, and export clean CSV datasets.

---

## Architecture

```
PDF Upload → Text Extraction (PyMuPDF/pdfplumber/OCR)
          → Chunking (2000 tokens, 10% overlap)
          → Claude Extraction (structured JSON)
          → Validation (confidence score + issues)
          → PostgreSQL Storage
          → React UI (editable form)
          → CSV Export
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, TailwindCSS, Zustand    |
| Backend   | FastAPI, SQLAlchemy, Alembic        |
| AI        | Claude claude-opus-4-5 (Anthropic)         |
| Database  | PostgreSQL 16                       |
| PDF       | PyMuPDF, pdfplumber, Tesseract OCR  |

---

## Folder Structure

```
meta-analysis/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial.py
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── config.py            # Settings (pydantic-settings)
│       ├── database.py          # SQLAlchemy engine + session
│       ├── models/
│       │   └── __init__.py      # User, Project, Study, TextChunk, Extraction
│       ├── schemas/
│       │   └── __init__.py      # Pydantic request/response models
│       ├── routers/
│       │   ├── auth.py          # POST /auth/register, /auth/login, /auth/me
│       │   ├── projects.py      # CRUD /projects
│       │   ├── studies.py       # POST /upload/:id, GET /studies/:id
│       │   ├── extraction.py    # POST /extraction/extract/:id, GET/PUT
│       │   ├── export.py        # GET /export/:project_id (CSV)
│       │   └── study_detail.py  # GET /study-detail/:id (with raw_text)
│       ├── services/
│       │   ├── pdf_processor.py # PyMuPDF → pdfplumber → Tesseract
│       │   ├── chunking.py      # tiktoken-based 2000-token chunker
│       │   └── claude_service.py# Extraction + validation via Claude API
│       └── utils/
│           ├── auth.py          # JWT + bcrypt
│           └── csv_export.py    # Flatten JSON → CSV rows
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── globals.css
        │   ├── page.tsx                           # Redirect
        │   ├── auth/login/page.tsx
        │   ├── auth/register/page.tsx
        │   ├── dashboard/page.tsx
        │   ├── projects/page.tsx
        │   ├── projects/[id]/page.tsx             # Upload + study list
        │   └── projects/[id]/extract/[studyId]/   # Split-screen extraction
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx
        │   │   ├── AuthGuard.tsx
        │   │   └── Sidebar.tsx
        │   ├── projects/
        │   │   ├── DropZone.tsx
        │   │   └── StudyRow.tsx
        │   └── extraction/
        │       ├── ExtractionForm.tsx
        │       ├── OutcomesTable.tsx
        │       └── ConfidenceBadge.tsx
        ├── store/
        │   ├── authStore.ts
        │   ├── projectStore.ts
        │   └── extractionStore.ts
        ├── lib/
        │   ├── api.ts
        │   └── utils.ts
        └── types/
            └── index.ts
```

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Docker & Docker Compose installed
- Anthropic API key

### Steps

```bash
# 1. Clone / unzip the project
cd meta-analysis

# 2. Set up environment
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY and a strong SECRET_KEY

# 3. Start everything
docker-compose up --build

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

That's it. Docker handles PostgreSQL, migrations (via SQLAlchemy auto-create), and both services.

---

## Manual Setup (Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16 running locally
- Tesseract OCR installed

```bash
# macOS:   brew install tesseract
# Ubuntu:  sudo apt install tesseract-ocr
# Windows: https://github.com/UB-Mannheim/tesseract/wiki
```

---

### Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE meta_analysis;"

# 4. Configure environment
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://postgres:password@localhost:5432/meta_analysis
#   SECRET_KEY=your-strong-secret-key-here
#   ANTHROPIC_API_KEY=sk-ant-your-key-here

# 5. Run migrations
alembic upgrade head
# OR let FastAPI auto-create tables on startup (Base.metadata.create_all)

# 6. Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start dev server
npm run dev
```

App available at: http://localhost:3000

---

## API Reference

### Auth
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /auth/register    | Create account     |
| POST   | /auth/login       | Login, get JWT     |
| GET    | /auth/me          | Get current user   |

### Projects
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /projects         | Create project     |
| GET    | /projects         | List all projects  |
| GET    | /projects/:id     | Get single project |
| DELETE | /projects/:id     | Delete project     |

### Studies
| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| POST   | /upload/:project_id    | Upload PDF              |
| GET    | /studies/:project_id   | List studies in project |
| GET    | /study/:study_id       | Get study metadata      |
| GET    | /study-detail/:id      | Get study with raw text |
| DELETE | /study/:study_id       | Delete study            |

### Extraction
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | /extraction/extract/:study  | Run Claude extraction + validation |
| GET    | /extraction/:study          | Get existing extraction            |
| PUT    | /extraction/:study          | Update (save edits)                |

### Export
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /export/:project_id   | Download CSV        |

---

## Extraction Schema

```json
{
  "study_id": "Smith 2023",
  "study_design": "Randomized Controlled Trial",
  "sample_size": {
    "intervention": 145,
    "control": 143,
    "total": 288
  },
  "population": {
    "condition": "Type 2 Diabetes Mellitus",
    "age_mean": 62.4
  },
  "intervention": "Metformin 500mg twice daily",
  "comparator": "Placebo",
  "outcomes": [
    {
      "name": "HbA1c reduction",
      "effect_measure": "Mean Difference",
      "effect_value": "-1.2",
      "confidence_interval": "[-1.8, -0.6]",
      "p_value": "< 0.001"
    }
  ]
}
```

---

## CSV Export Format

One row per outcome. Columns:

```
study_db_id, file_name, study_id, study_design,
sample_intervention, sample_control, sample_total,
condition, age_mean, intervention, comparator,
confidence_score, outcome_name, effect_measure,
effect_value, confidence_interval, p_value
```

---

## Claude API Integration

The extraction pipeline in `backend/app/services/claude_service.py`:

```python
# 1. Extract structured data from each text chunk
extracted_data, raw = extract_from_chunks(chunks)

# 2. Validate extraction against source text  
confidence_score, issues = validate_extraction(extracted_data, raw_text[:6000])
```

Claude is called with two passes:
- **Pass 1 — Extraction**: Structured JSON extraction per chunk, best result selected by outcome count
- **Pass 2 — Validation**: Cross-checks extracted JSON against source text, returns confidence score (0.0–1.0) and list of issues

Both calls retry up to 2 times on failure, and re-prompt if JSON is malformed.

---

## Security Notes

- All passwords hashed with bcrypt (passlib)
- JWT tokens expire after 24 hours (configurable)
- File uploads validated: PDF only, 10MB max, UUID-prefixed filenames
- All endpoints protected with Bearer JWT auth
- CORS restricted to localhost:3000 in dev (update for production)

---

## Production Checklist

- [ ] Set strong `SECRET_KEY` (min 32 chars, random)
- [ ] Set `ANTHROPIC_API_KEY`
- [ ] Update CORS origins in `backend/app/main.py`
- [ ] Use a managed PostgreSQL (RDS, Supabase, Neon)
- [ ] Store uploads in S3 or equivalent
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend domain
- [ ] Enable HTTPS
- [ ] Set `output: "standalone"` in next.config.js for Docker

---

## Common Issues

**`ModuleNotFoundError: No module named 'fitz'`**
→ Run `pip install pymupdf`

**`tesseract is not installed or not in your PATH`**
→ Install Tesseract OCR for your OS (see above)

**`relation "users" does not exist`**
→ Run `alembic upgrade head` or restart backend (auto-creates tables)

**CORS error from frontend**
→ Confirm `NEXT_PUBLIC_API_URL` matches backend URL exactly (no trailing slash)

**Claude extraction returns empty**
→ Check `ANTHROPIC_API_KEY` is set correctly in backend `.env`
