# Tech Stack Rules

When writing code for GregMD, you must strictly adhere to the following rules based on our chosen technology stack.

## General
- Write clean, modular, and well-documented code.
- Prioritize type safety in both Python and TypeScript.
- Never invent features outside the current spec.

## Backend (Python / FastAPI)
- Use **Python 3.12+** typing features extensively (e.g., `list[str]`, `dict[str, Any]`, `|` for Union).
- Use **FastAPI** for all API routing. Endpoints must be asynchronous (`async def`).
- Use **Pydantic** (v2) for all data validation, schemas, and API request/response models.
- Use **Pydantic AI** for agentic workflows and interacting with LLMs. Structure prompts and outputs using Pydantic models.
- Database access should be done via an ORM (like **SQLModel** or SQLAlchemy) asynchronously.
- Always use dependency injection (`Depends()`) for database sessions and services.

## Frontend (Next.js / React)
- Use the **Next.js App Router** (`app/` directory).
- All components should be Server Components by default. Use `"use client"` only when necessary (e.g., for interactivity, hooks, or charts).
- Use **TypeScript** strictly. Define `interfaces` or `types` for all component props and API responses.
- Styling must be done using **Tailwind CSS**.
- Use **shadcn/ui** components for standardized UI elements.
- For AI streaming features (like chat or dynamic components), utilize the **Vercel AI SDK**.
- For data visualization (lab results, etc.), use **Recharts**. Ensure charts are responsive and support dark mode.

## AI & LLMs
- Support Bring Your Own Key (BYOK). The system must read API keys from environment variables or a user configuration database table.
- Support multiple providers (OpenAI, Anthropic, DeepSeek). Ensure provider-agnostic abstractions where possible.
