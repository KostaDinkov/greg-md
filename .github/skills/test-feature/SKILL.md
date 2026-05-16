---
name: test-feature
description: >
  Use this skill to validate a feature against its acceptance criteria and
  produce a formal QA report with a go/no-go decision. Activate when asked to
  test, validate, QA-check, or verify a feature, run acceptance tests, or check
  if a feature is ready for review — even if the user doesn't explicitly say "QA"
  or "acceptance criteria."
compatibility: Requires pytest, npm, Playwright. All project services must be running (Docker/PostgreSQL on 5432, backend on 8089, frontend on 3000).
---

# Test Feature Validation

## Pre-requisites Check

Confirm services are up before proceeding. If any fail, stop and report environment failure — do not proceed with validation.

```powershell
# Verify all three services
docker ps --filter "name=gregmd-postgres" --format "{{.Status}}"
Invoke-WebRequest -Uri "http://localhost:8089/api/v1/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

If services are down: output which service failed, reference `.github/skills/project-setup/SKILL.md` for fix instructions, and stop.

## Feature Discovery

1. Read `specs/features/{feature-name}/spec.md` — extract all acceptance criteria, number them AC #1, AC #2, etc.
2. Read `specs/features/{feature-name}/implementation-plan.md` — note test locations and key files.
3. Test locations:
   - Backend: `src/tests/backend/test_*.py`
   - Frontend: `src/frontend/src/__tests__/*.test.tsx`
   - E2E: `src/tests/e2e/*.spec.ts`

## Test Execution

Run all suites. Capture pass/fail counts and any failure output.

```powershell
# Backend
cd d:\Projects\Programming\greg-md\src\tests\backend ; pytest -v

# Frontend
cd d:\Projects\Programming\greg-md\src\frontend ; npm test -- --verbose

# E2E (requires backend + frontend running)
cd d:\Projects\Programming\greg-md\src\tests\e2e ; npm run test:e2e
```

## Acceptance Criteria Validation

For each AC:

1. Identify which tests cover it (or if manual verification is needed)
2. Execute and collect evidence
3. For UI/UX criteria — use browser tools: `open_browser_page`, `click_element`, `read_page`
4. Record PASS (with evidence) or FAIL (create defect)

## Defect Reporting

For each failed AC, create a defect. See `references/defect-guide.md` for the template and severity guidelines.

Severity rules (quick reference):

- **Critical**: Feature completely broken / blocker
- **High**: Core AC not met, no workaround
- **Medium**: Partial failure, workaround exists
- **Low**: Minor issue, doesn't block acceptance

## Report Generation

Use the template in `assets/qa-report-template.md`. Fill in all sections — do not omit any.

**Save the completed report:**

1. Create the qa-reports directory if it doesn't exist:

   ```powershell
   New-Item -ItemType Directory -Force -Path "specs/features/{feature-name}/qa-reports"
   ```

2. Use the `create_file` tool to write the report:
   - **File path:** `specs/features/{feature-name}/qa-reports/{YYYY-MM-DD-HHMM}-qa-report.md`
   - **Format:** Use current date/time in format `2026-05-16-1704` (YYYY-MM-DD-HHMM)
   - **Content:** Complete QA report based on template with all sections filled

3. Confirm file creation and report the saved path to the user

## Go/No-Go Decision

**GO**: All ACs pass, no Critical/High defects.

**NO-GO**: Any AC fails, or any Critical/High defect found.

Edge cases: Low/Medium defects that don't block core functionality can be GO with documented recommendations.

## Gotchas

- **Backend test path**: Run pytest from `src/tests/backend/`, not from `src/backend/` — the conftest.py is at the tests root.
- **Frontend test runner**: `npm test` runs in watch mode by default. Use `npm test -- --watchAll=false` for CI-style single run.
- **E2E test location**: E2E tests are in `src/tests/e2e/`, not in `src/frontend/`. Check `playwright.config.ts` for base URL config.
- **Health endpoint**: Use `/api/v1/health` for the backend, not `/health` (the root path may serve a different service).
- **Port 8089 conflict**: Other Docker containers (e.g., BakeryOps) may occupy port 8089. Run `docker ps --filter "publish=8089"` if the health check fails unexpectedly.
- **Database state**: Backend tests use in-memory SQLite. E2E tests hit the real PostgreSQL. A fresh E2E run may behave differently if the database has leftover data.
- **OpenAI key required**: Extraction tests that call the LLM need `OPENAI_API_KEY` set. Tests that mock the LLM do not.
