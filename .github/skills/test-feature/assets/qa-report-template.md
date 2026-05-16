# QA Validation Report: {Feature Name}

**Date:** {YYYY-MM-DD HH:MM}
**Validator:** qa-validator agent
**Feature Spec:** [specs/features/{feature-name}/spec.md](../../../../specs/features/{feature-name}/spec.md)
**Decision:** `GO` | `NO-GO`

---

## Executive Summary

{1-2 sentences: overall result, test counts, decision rationale.}

---

## Test Results

### Backend Tests

- **Status:** PASS | FAIL
- **Tests Run:** {count}
- **Passed:** {count}
- **Failed:** {count}
- **Duration:** {X}s
- **Evidence:**
  ```
  {paste pytest summary output here}
  ```

### Frontend Tests

- **Status:** PASS | FAIL
- **Tests Run:** {count}
- **Passed:** {count}
- **Failed:** {count}
- **Evidence:**
  ```
  {paste jest summary output here}
  ```

### E2E Tests

- **Status:** PASS | FAIL
- **Scenarios:** {count}
- **Passed:** {count}
- **Failed:** {count}
- **Evidence:**
  ```
  {paste playwright summary output here}
  ```

---

## Acceptance Criteria Validation

### AC #1: {Description from spec}

- **Status:** ✅ PASS | ❌ FAIL
- **Evidence:** {test name, manual verification description, or screenshot}
- **Notes:** {optional}

### AC #2: {Description from spec}

- **Status:** ✅ PASS | ❌ FAIL
- **Evidence:** {evidence}

{Repeat for all ACs}

---

## Defects

{If GO: "No defects found."}

{If NO-GO, list each defect:}

### DEF-001: {Short Title}

- **Severity:** Critical | High | Medium | Low
- **Acceptance Criterion:** AC #{number}
- **Description:** {What is broken}
- **Repro Steps:**
  1. {Step}
  2. {Step}
- **Expected:** {What should happen}
- **Actual:** {What happens instead}
- **Evidence:** {link to test output, log line, or screenshot}

---

## Decision Rationale

{Why GO or NO-GO. For GO: "All {N} acceptance criteria validated, all test suites passing." For NO-GO: list the blocking ACs and why they fail.}

---

## Recommendations

{If GO: optional suggestions, technical debt observations.}
{If NO-GO: what must be fixed and in what priority order.}

---

## Coverage Summary

- **Backend Tests:** {N} tests covering {areas}
- **Frontend Tests:** {N} tests covering {components}
- **E2E Tests:** {N} scenarios covering {user flows}
- **Manual Testing:** {what was manually verified, if anything}
- **Gaps:** {any areas not tested}
