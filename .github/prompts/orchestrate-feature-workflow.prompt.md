---
name: orchestrate-feature-workflow
description: Detect feature phase, resume from first incomplete phase, and route to the right role agent.
agent: Plan
model: Claude Sonnet 4.5 (copilot)
argument-hint: "feature-name and objective (for example: lab-extraction complete to Phase 4)"
---

# Orchestrate Feature Workflow

Given a feature request, orchestrate work using these role agents:

- `business-analyst`
- `software-developer`
- `qa-validator`
- `reviewer`

Process:

1. Detect current state for the target feature by checking existing artifacts in `specs/`, `src/`, and tests.
2. Check if working on `main` branch. If yes and starting new work, create feature branch first (Phase 0).
3. Identify the first incomplete phase:
   - Phase 0: Git branch creation (for new features)
   - Phase 1: Spec authoring
   - Phase 2: Implementation planning
   - Phase 3: Coding and testing
   - Phase 4: Completion reporting + PR creation
4. Resume from that phase only; do not restart completed phases.
5. Route to the corresponding role agent and request only phase-appropriate output.
6. At each phase end, provide a short handoff packet:
   - Completed items
   - Evidence links (files/tests)
   - Open questions and blockers
   - Next agent and expected output

Phase 0: Git Branch Creation (for new features only)

- Check current branch: `git branch --show-current`
- If on `main` and no feature branch exists: create `feature/{feature-name}` branch
- All subsequent work happens in the feature branch
- Skip this phase if already on a feature branch or resuming existing work

Phase 4: Completion Reporting + Pull Request

- `reviewer` agent generates completion report
- After completion report, create PR from feature branch to `main`:
  - PR title: "Feature: {Feature Name}"
  - PR description: Full Phase 4 completion report
  - Labels: `feature`, `ready-for-review`
- Provide PR link and merge instructions in final output

QA decision branch:

- If QA returns `no-go`, hand off back to `software-developer` with a defect packet and return to Phase 3.
- Defect packet must include:
  - Failed acceptance criteria
  - Repro steps and failing test evidence
  - Suspected root cause
  - Required fix scope
- After fixes, route again to `qa-validator`.
- Route to `reviewer` only after QA returns `go`.

Tools and skills policy:

- Enforce least privilege by role.
- Use planning and analysis-first behavior in `business-analyst`.
- Use implementation and test execution behavior in `software-developer`.
- Use verification and compliance behavior in `qa-validator`.
- Use reporting-only behavior in `reviewer`.
- If a required skill is missing, continue with best-effort role behavior and explicitly note the gap in the handoff packet.

If the user asks to "complete feature-x", always run state detection first and continue from the earliest incomplete phase.
