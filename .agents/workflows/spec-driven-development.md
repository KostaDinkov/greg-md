---
description: 
---

# Spec-Driven Development Workflow

As an AI agent working on GregMD, you must follow this workflow strictly when the user asks to "start working on a feature", "draft a spec", or "implement a spec".

## Phase 1: Spec Authoring
1. **Understand Request**: The user will request a new feature or core system component.
2. **Consult Templates**: Read `.agents/templates/feature-spec.md`.
3. **Draft Spec**: Generate the spec markdown file in `specs/core/` or `specs/features/{feature-name}/`. The spec MUST include:
   - Description
   - Requirements (functional/non-functional)
   - Acceptance Criteria
   - Data Models (if applicable)
   - API endpoints (if applicable)
4. **Request Review**: Stop and ask the user to review, modify, or approve the spec. **DO NOT WRITE CODE YET.**

## Phase 2: Implementation Planning
1. **Read Spec**: Once the spec is approved, read it thoroughly.
2. **Review Architecture & Stack**: Consult `docs/tech-stack.md` and `docs/architecture.md` to ensure the plan aligns with the project.
3. **Draft Implementation Plan**: Create a brief step-by-step technical plan for how you will implement the spec (e.g., "1. Create DB migration, 2. Add FastAPI route, 3. Create Next.js component"). 
4. **Request Approval**: Ask the user to approve the implementation plan.

## Phase 3: Coding and Testing
1. **Write Tests First (TDD)**: Based on `rules/test-coverage.md`, write tests that cover the acceptance criteria defined in the spec.
2. **Implement Feature**: Write the actual code to make the tests pass. Ensure you follow `rules/tech-stack-rules.md`.
3. **Verify**: Run the tests locally using the appropriate command (e.g., `pytest` or `npm run test`).
4. **Refactor**: Clean up the code, ensure types are strict, and add docstrings/comments.

## Phase 4: Completion
1. **Present Results**: Inform the user that the feature is complete.
2. **Provide Verification Steps**: Give the user instructions on how to manually verify the feature in the UI/API.
