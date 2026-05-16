# GregMD Test Suite

Complete test coverage for the Lab Extraction feature.

## Test Structure

```
src/
├── backend/
│   └── __tests__/     # Backend Python tests (pytest)
│       ├── test_api.py              # API endpoint tests
│       ├── test_extraction_agent.py # AI extraction tests
│       ├── conftest.py              # Test configuration
│       └── __init__.py
├── frontend/
│   └── src/
│       └── __tests__/ # Frontend React tests (Jest)
│           ├── UploadLabForm.test.tsx
│           ├── LabResultsTable.test.tsx
│           ├── BiomarkerChart.test.tsx
│           └── e2e/   # End-to-end tests (Playwright)
│               └── lab_upload_flow.spec.ts
└── tests/
    └── fixtures/      # Test data and sample files
        ├── sample-lab-report.pdf    # Generated test PDF
        ├── generate_sample_pdf.py   # PDF generator script
        └── README.md
```

## Quick Start

### 1. Backend Tests (✅ 100% Passing)

```bash
cd src/backend
python -m pip install -r requirements.txt
python -m pytest __tests__/ -v
```

**Expected:** 30 tests passing

### 2. Frontend Tests

```bash
cd src/frontend
npm install --legacy-peer-deps
npm test
```

**Note:** If React 19 JSX runtime error occurs, see "Troubleshooting" below.

### 3. E2E Tests

```bash
# Terminal 1: Start backend
cd src/backend
python -m uvicorn main:app --reload

# Terminal 2: Start frontend
cd src/frontend
npm run dev

# Terminal 3: Run E2E tests
cd src/frontend
npm run test:e2e
```

## Test Coverage

### Backend (30 tests)

- **API Endpoints:** 11 tests
  - Health check
  - Upload (success, errors, validation)
  - Status polling
  - Results retrieval
- **PDF Service:** 8 tests
  - Text extraction
  - Multi-page handling
  - Error cases
- **Extraction Agent:** 11 tests
  - Pydantic model validation
  - LLM response handling
  - Edge cases

### Frontend (33 tests)

- **UploadLabForm:** 8 tests
  - File selection
  - Upload flow
  - Error handling
- **LabResultsTable:** 13 tests
  - Data display
  - Empty states
  - Error handling
- **BiomarkerChart:** 12 tests
  - Chart rendering
  - Biomarker selection
  - Time series display

### E2E (8 scenarios)

- Complete upload flow
- Form validation
- API integration
- Error scenarios

## Running Specific Tests

### Backend

```bash
# Run a specific test file
pytest ../tests/backend/test_api.py -v

# Run a specific test function
pytest ../tests/backend/test_api.py::TestHealthEndpoint::test_health_check -v

# Run with coverage report
pytest ../tests/backend/ --cov=. --cov-report=html
```

### Frontend

```bash
# Run a specific test file
npm test -- UploadLabForm.test.tsx

# Run in watch mode
npm run test:watch

# Update snapshots
npm test -- -u
```

### E2E

```bash
# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test lab_upload_flow.spec.ts

# Debug mode
npx playwright test --debug
```

## Troubleshooting

### Frontend Tests: React 19 JSX Runtime Error

If you see `Cannot find module 'react/jsx-runtime'`:

**Solution 1:** Install SWC transformer

```bash
npm install --save-dev @swc/jest @swc/core
```

**Solution 2:** Add to package.json

```json
"jest": {
  "testEnvironmentOptions": {
    "customExportConditions": [""]
  }
}
```

### Backend Tests: Module Not Found

```bash
# Ensure you're in the backend directory
cd src/backend

# Install all dependencies
python -m pip install -r requirements.txt

# Verify Python path includes backend/
python -c "import sys; print(sys.path)"
```

### E2E Tests: Connection Refused

Ensure both servers are running:

```bash
# Backend should be on http://localhost:8000
curl http://localhost:8000/api/v1/health

# Frontend should be on http://localhost:3000
curl http://localhost:3000
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: |
          cd src/backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd src/backend
          pytest ../tests/backend/ -v --cov=.

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - name: Install dependencies
        run: |
          cd src/frontend
          npm ci --legacy-peer-deps
      - name: Run tests
        run: |
          cd src/frontend
          npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4
      - name: Install dependencies
        run: |
          cd src/backend && pip install -r requirements.txt
          cd ../frontend && npm ci --legacy-peer-deps
      - name: Install Playwright
        run: cd src/frontend && npx playwright install --with-deps
      - name: Run E2E tests
        run: cd src/frontend && npm run test:e2e
```

## Test Data

### Sample PDF

Located at `src/tests/fixtures/sample-lab-report.pdf`

**Regenerate:**

```bash
cd src/tests/fixtures
python generate_sample_pdf.py
```

**Contents:**

- Date: January 15, 2024
- Lab: Quest Diagnostics
- 6 biomarkers: Hemoglobin, Vitamin D, Glucose, Cholesterol, TSH, Vitamin B12

## Best Practices

1. **Run tests before committing**

   ```bash
   cd src/backend && pytest ../tests/backend/ -v
   cd src/frontend && npm test
   ```

2. **Keep tests isolated**
   - Backend tests use in-memory SQLite
   - Frontend tests mock fetch API
   - E2E tests use dedicated test data

3. **Update tests with code changes**
   - If API changes, update test_api.py
   - If component props change, update component tests
   - Keep test data in sync with models

4. **Use descriptive test names**
   - `test_upload_non_pdf_file` ✅
   - `test_upload_error` ❌

5. **Test edge cases**
   - Empty states
   - Error conditions
   - Invalid inputs
   - Loading states

## Documentation

- **Implementation Plan:** `specs/features/lab-extraction/implementation-plan.md`
- **Feature Spec:** `specs/features/lab-extraction/spec.md`
- **Phase 3 Handoff:** `PHASE3_HANDOFF.md`

## Support

For questions or issues with tests:

1. Check test output for specific error messages
2. Review PHASE3_HANDOFF.md for known issues
3. Ensure all dependencies are installed
4. Verify database and servers are running for E2E tests
