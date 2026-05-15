# Implementation Plan: Lab Report Extraction & Querying

Since this is the very first feature of the project, this plan includes the initial scaffolding of the frontend and backend architectures before diving into the specific feature implementation.

## Phase 1: Project Initialization & Scaffolding
1. **Backend Initialization**:
   - Create `src/backend` directory.
   - Set up Python virtual environment / dependency management (e.g., using `uv` or `pip`).
   - Install core dependencies: `fastapi`, `uvicorn`, `sqlmodel`, `alembic`, `pydantic-ai`, `pypdf`, `python-multipart`.
2. **Frontend Initialization**:
   - Create `src/frontend` directory using `npx create-next-app@latest` (App Router, TS, Tailwind).
   - Install `shadcn/ui` and initialize core UI components (buttons, tables, dialogs).
   - Install `recharts` for data visualization.
3. **Database Infrastructure**:
   - Create `docker-compose.yml` at the root to spin up a `pgvector/pgvector:pg16` PostgreSQL database container.

## Phase 2: Database Schema & Models (Backend)
1. Set up **Alembic** for database migrations.
2. Define **SQLModel** classes in `src/backend/models/`:
   - `LabReport` (id, filename, status, created_at)
   - `LabResult` (id, report_id, biomarker_name, value, unit, reference_range, is_flagged, test_date)
3. Generate and apply the initial database migration.

## Phase 3: AI Extraction Service (Backend)
1. **PDF Parsing**: Write a utility `src/backend/services/pdf_service.py` to extract raw text from uploaded PDFs.
2. **Pydantic AI Agent**: Write `src/backend/services/extraction_agent.py`.
   - Define the Pydantic schemas (`BiomarkerResult`, `LabExtractionResponse`) from the spec.
   - Initialize the `pydantic-ai` agent.
   - Write the prompt and configure the LLM provider connection (reading API key from `.env`).
3. **Write Tests**: Create `tests/backend/test_extraction.py` to test the prompt schema using a mocked LLM response.

## Phase 4: API Endpoints (Backend)
1. **Upload Endpoint**: Implement `POST /api/v1/labs/upload`.
   - Save file temporarily -> Extract text -> Send to Pydantic AI -> Save results to DB -> Return Report ID.
2. **Status Endpoint**: Implement `GET /api/v1/labs/{report_id}/status` (useful if we move extraction to a background task, though initially we can do it synchronously).
3. **Results Endpoint**: Implement `GET /api/v1/labs/results` to query the extracted data.

## Phase 5: Frontend UI & Integration
1. **Upload Component**: Create a Next.js client component `UploadLabForm.tsx` using a file input and progress indicator.
2. **Dashboard View**:
   - Create `LabResultsTable.tsx` using `shadcn/ui` table to list the latest extracted markers.
   - Create `BiomarkerChart.tsx` using `recharts` to plot a specific biomarker's values over time.
3. **Integration**: Connect the frontend to the FastAPI backend using standard fetch or React Query.

## Phase 6: End-to-End Verification
1. Run the stack locally via Docker Compose.
2. Upload a sample lab PDF (from `data/samples/`).
3. Verify that the table updates and the chart renders the data correctly.
