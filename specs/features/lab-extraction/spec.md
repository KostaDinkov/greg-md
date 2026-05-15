# Feature Spec: Lab Report Extraction & Querying

## 1. Description
This feature allows users to upload PDF lab reports (e.g., blood tests, hormone panels). The system will automatically parse the PDF, use a Large Language Model (LLM) to extract structured biomarkers (like Hemoglobin, Cholesterol, Testosterone), and persist them to the database. Users can then view their extracted data in tabular formats and trend charts over time.

## 2. Requirements
### 2.1 Functional Requirements
- **Upload**: The user must be able to upload one or more PDF lab reports via the UI.
- **Processing**: The system shall process the uploaded PDF asynchronously, using a configured LLM provider to extract biomarkers.
- **Validation**: The system shall use Pydantic AI to validate the LLM output against a predefined biomarker schema (e.g., name, value, unit, reference range, date).
- **Persistence**: Extracted data must be saved to the database, associated with the current user.
- **Visualization**: The user must be able to view a table of their latest lab results.
- **Trending**: The user must be able to select specific biomarkers and view a line chart showing changes over time.

### 2.2 Non-Functional Requirements

- **Security/Privacy**: The LLM API calls must not log data for training (ensure Zero Data Retention policies if using OpenAI/Anthropic).
- **Extensibility**: The system must be able to handle lab reports from various EU and international labs without hardcoded templates.

## 3. Acceptance Criteria
- [ ] **Upload & Extract**: Given a valid lab report PDF, When the user uploads it, Then the system successfully extracts at least 90% of the visible biomarkers into a structured JSON format.
- [ ] **Data Persistence**: Given successful extraction, When processing completes, Then the records are correctly stored in the PostgreSQL database.
- [ ] **Error Handling**: Given a malformed or non-medical PDF, When uploaded, Then the system returns a polite error explaining it could not find lab results.
- [ ] **UI Rendering (Table)**: Given stored lab data, When the user visits the dashboard, Then they see a sortable table of their latest results.
- [ ] **UI Rendering (Chart)**: Given historical lab data for "Vitamin D", When the user selects it, Then they see a Recharts line graph plotting the values over time.

## 4. Technical Details
### 4.1 Data Models / Schema
- `LabReport` table: Tracks the uploaded file metadata, status (processing, complete, failed), and date.
- `Biomarker` table: A dictionary of known biomarkers (optional, but good for standardization).
- `LabResult` table: Links a user, a `LabReport`, a specific biomarker name, the float value, string unit, reference range, and the date of the test.

### 4.2 API Endpoints
- `POST /api/v1/labs/upload`: Accepts a multipart/form-data PDF file. Returns a job/report ID.
- `GET /api/v1/labs/{report_id}/status`: Polling endpoint for extraction status.
- `GET /api/v1/labs/results`: Returns the user's structured lab results, with optional query params for filtering by date or biomarker.

### 4.3 AI / Prompt Engineering
- **Provider**: Configurable (OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet).
- **Library**: `pydantic-ai`
- **Output Schema (Pydantic)**:
  ```python
  class BiomarkerResult(BaseModel):
      name: str
      value: float
      unit: str
      reference_range: str | None = None
      is_flagged: bool | None = None # True if outside reference range

  class LabExtractionResponse(BaseModel):
      test_date: date
      lab_name: str | None
      results: list[BiomarkerResult]
  ```
- **Prompt Structure**: "You are an expert medical data extractor. Extract the date of the test and all lab results from the following text/PDF content. Map them exactly to the provided schema. Do not invent data."
