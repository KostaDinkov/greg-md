---
description: Run the GregMD spec-driven development workflow for new features.
name: spec-driven-development
agent: Plan
model: GPT-5 (copilot)
argument-hint: "feature-name and requested outcome"
---

# Spec-Driven Development Workflow

Follow this workflow when asked to start a feature, draft a spec, implement a spec, or complete previously started work.

## Phase 0: Intake And State Detection

1. Identify the feature scope and target folder.
2. Check existing artifacts in `specs/`, `src/`, and tests.
3. Detect the first incomplete phase and resume from there.
4. Report current state before taking action.

Resume rule:

- If user asks to "complete feature-x", do not restart from Phase 1.
- Continue from the earliest incomplete phase.

## Phase 1: Spec Authoring

1. Understand the request.
2. Consult `.agents/templates/feature-spec.md`.
3. Draft the spec in `specs/core/` or `specs/features/{feature-name}/` with:
   - Description
   - Requirements (functional/non-functional)
   - Acceptance criteria
   - Data models (if applicable)
   - API endpoints (if applicable)
4. Request review and approval before writing code.

## Phase 2: Implementation Planning

1. Read the approved spec thoroughly.
2. Consult `docs/tech-stack.md` and `docs/architecture.md`.
3. Draft a concise step-by-step implementation plan.
4. Ask for user approval.

## Phase 3: Coding and Testing

1. Write tests first from acceptance criteria.
2. Implement the feature to satisfy tests and stack rules.
3. Run tests locally.
4. Refactor and keep typing strict.
5. Ensure acceptance criteria are met and tests pass before considering the feature complete.

Phase 3 exit criteria:

- Acceptance criteria mapped to tests.
- Relevant tests passing.
- Any deviations documented.

QA branch:

- If QA returns `no-go`, hand work back to `software-developer` with a defect packet and continue in Phase 3 until QA returns `go`.

## Phase 4: Completion

1. Present completion summary.
2. Provide manual verification steps for UI/API.

Phase 4 required artifacts:

- Completion report.
- Risk and limitation notes.
- Suggested PR summary.

Role routing (optional):

- `business-analyst` for Phases 1-2
- `software-developer` for Phase 3
- `qa-validator` for verification
- `reviewer` for final reporting

Role tool/skill expectations:

- `business-analyst`: read/search and spec-authoring skills.
- `software-developer`: edit/test/debug tools and implementation skills.
- `qa-validator`: verification/test/compliance tools and risk skills.
- `reviewer`: synthesis/reporting tools and closure skills.
