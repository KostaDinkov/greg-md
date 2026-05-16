---
applyTo: "src/**"
---

# Tech Stack Rules

When writing code for GregMD, strictly adhere to these stack rules.

## General

- Write clean, modular, and well-documented code.
- Prioritize type safety in Python and TypeScript.
- Never invent features outside the current spec.

## Backend (Python / FastAPI)

- Use Python 3.12+ typing features extensively (e.g., `list[str]`, `dict[str, Any]`, `|` for Union).
- Use FastAPI for routing, with asynchronous endpoints (`async def`).
- Use Pydantic v2 for validation and request/response schemas.
- Use Pydantic AI for agentic workflows and LLM interactions.
- Access the database via an async ORM (SQLModel or SQLAlchemy).
- Use dependency injection (`Depends()`) for sessions and services.

## Frontend (Next.js / React)

- Use Next.js App Router (`app/` directory).
- Components should be Server Components by default; use `"use client"` only when needed.
- Use strict TypeScript and define props/API response types.
- Use Tailwind CSS for styling.
- Use shadcn/ui for standardized UI elements.
- For AI streaming features, use Vercel AI SDK.
- For lab data visualization, use Recharts with responsive behavior and dark mode support.

## AI & LLMs

- Support BYOK using environment variables or user configuration storage.
- Support multiple providers (OpenAI, Anthropic, DeepSeek) via provider-agnostic abstractions.
