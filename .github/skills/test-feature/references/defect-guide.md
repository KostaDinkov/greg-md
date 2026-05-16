# Defect Reporting Guide

Use this template when an acceptance criterion fails. Load this file when writing defects for a QA report.

## Defect Template

```markdown
### DEF-{counter}: {Short Title}

- **Severity:** Critical | High | Medium | Low
- **Acceptance Criterion:** AC #{number}
- **Description:** {What is broken — one sentence}
- **Repro Steps:**
  1. {Exact step}
  2. {Exact step}
  3. {Observe the failure}
- **Expected:** {What should happen per the spec}
- **Actual:** {What happens instead}
- **Evidence:** {Failing test name, log output, or screenshot reference}
```

## Severity Guidelines

| Severity     | When to use                                                   |
| ------------ | ------------------------------------------------------------- |
| **Critical** | Feature completely non-functional; blocks all further testing |
| **High**     | Core acceptance criterion not met; no workaround available    |
| **Medium**   | Partial failure; workaround exists but degrades experience    |
| **Low**      | Minor issue; doesn't block the feature or acceptance          |

## What Makes a Good Defect

- **Reproducible**: Repro steps must produce the failure consistently
- **Specific**: Reference the exact AC, test name, or UI element
- **Evidence-backed**: Always include a test failure line, log snippet, or screenshot
- **Actionable**: The developer should know what to fix from the description alone

## Defect Numbering

Number defects sequentially within a single report: DEF-001, DEF-002, etc.
Across reports for the same feature, continue from the last number (check prior reports in `qa-reports/`).
