---
name: test-feature
description: Run QA validation on a feature and produce a test report with go/no-go decision.
agent: Plan
model: Claude Sonnet 4.5 (copilot)
argument-hint: "feature-name (for example: lab-extraction)"
---

# Test Feature Workflow

Orchestrate QA validation for a feature by running environment checks, invoking the qa-validator agent, and persisting the report.

## Process

### 1. Accept Feature Name

- Feature name provided by user (e.g., `lab-extraction`)
- Will look for spec in `specs/features/{feature-name}/`

### 2. Pre-flight Health Check

**Purpose:** Short-circuit on environment failures before invoking QA agent.

Run these checks:

```powershell
# Check Docker
docker ps --filter "name=gregmd-postgres" --format "{{.Status}}"

# Check Backend
Invoke-WebRequest -Uri "http://localhost:8089/api/v1/health" -UseBasicParsing

# Check Frontend
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

**If ANY service is down:**

- ❌ Display error with service status table
- ❌ Provide setup instructions (reference `.github/skills/project-setup/SKILL.md`)
- ❌ **STOP** - Do not invoke qa-validator agent
- ❌ Exit with message: "Fix environment and retry: /test-feature {feature-name}"

**If ALL services are up:**

- ✅ Log: "Environment check passed"
- ✅ Proceed to QA agent invocation

### 3. Invoke QA Validator Agent

Call the `qa-validator` agent with:

```
Validate the {feature-name} feature.

Feature location: specs/features/{feature-name}/

The qa-validator agent will:
1. Use the test-feature skill for procedures
2. Execute all test suites
3. Validate acceptance criteria
4. Produce formal QA report in markdown

Return the complete QA report.
```

The agent will use `.github/skills/test-feature.skill.md` for detailed procedures.

### 4. Save QA Report (if invoked standalone)

**Note:** The qa-validator agent now has file writing capabilities and can save its own report. This step is only needed when this prompt orchestrates standalone testing (e.g., `/test-feature`).

If the agent returns a report but hasn't saved it yet, save it:

**Path:** `specs/features/{feature-name}/qa-reports/{YYYY-MM-DD-HHMM}-qa-report.md`

**Steps:**

1. Generate timestamp (ISO format: `YYYY-MM-DD-HHMM`)
2. Create directory if doesn't exist: `specs/features/{feature-name}/qa-reports/`
3. Write report to file
4. Capture file path for user output

**If agent already saved the report:** Skip this step and use the path from the agent's output.

### 5. Display Summary to User

Parse the report and display a concise summary:

**If GO:**

```
✅ QA Validation Complete: {feature-name}

Decision: GO
Test Results:
  - Backend: {X}/{X} passed
  - Frontend: {X}/{X} passed
  - E2E: {X}/{X} passed

All acceptance criteria validated: {X}/{X} PASS
No defects found.

Full report: {file-path}
```

**If NO-GO:**

```
❌ QA Validation Complete: {feature-name}

Decision: NO-GO
Test Results:
  - Backend: {X}/{Y} passed ({Y-X} failed)
  - Frontend: {X}/{Y} passed ({Y-X} failed)
  - E2E: {X}/{Y} passed ({Y-X} failed)

Failed acceptance criteria: {X}/{Y}
Defects found: {count} ({breakdown by severity})

Critical Issues:
  - DEF-001: {title} (AC #{X})
  - DEF-002: {title} (AC #{X})

Full report: {file-path}
Recommended action: Route to software-developer for fixes
```

**If Environment Failure (from step 2):**

```
❌ Environment Check Failed: Cannot run QA validation

Service Status:
  {check} PostgreSQL: {status}
  {check} Backend API: {status}
  {check} Frontend: {status}

Action Required:
1. {specific fix based on which service failed}
2. Or follow full setup: .github/skills/project-setup/SKILL.md

Once services are running, retry: /test-feature {feature-name}
```

---

## Orchestration Notes

**This prompt is lightweight orchestration:**

- Does NOT contain validation procedures (those are in test-feature skill)
- Does NOT execute tests directly (qa-validator agent does that)
- DOES handle environment checks (fast-fail on infrastructure issues)
- DOES persist reports (standardized location)
- DOES format user output (clean summaries)

**The heavy lifting happens in:**

- `.github/skills/test-feature.skill.md` - Validation procedures, report template
- `.github/agents/qa-validator.agent.md` - QA agent that uses the skill

---

## Integration with Orchestration Workflow

**Standalone use:**

```
/test-feature lab-extraction
```

**From orchestrator:**
At Phase 3 completion, orchestrator can invoke qa-validator agent directly. The agent will use the test-feature skill and save its own report using its file writing tools.

**Key difference:**

- Standalone: This prompt does pre-flight + invoke agent + save report (if needed)
- Orchestrator: Calls qa-validator directly, agent saves its own report
- Agent: Now has `write/createFile` tool and can save reports autonomously

---

## Error Handling Philosophy

**Short-circuit on ENVIRONMENT issues:**

- Docker not running → Can't test
- Database unreachable → Tests will crash
- Backend/Frontend down → Nothing to validate
- **Action:** Fast-fail with setup instructions

**Route to QA agent for IMPLEMENTATION issues:**

- Tests fail → Defect
- Feature doesn't meet AC → Defect
- Performance problems → Defect
- **Action:** Agent documents in formal report

**Why:**

- Environment issues = simple fixes (start services)
- Implementation issues = need analysis, evidence, repro steps
- QA reports document feature quality, not infrastructure problems
- Faster feedback on setup vs. code issues
