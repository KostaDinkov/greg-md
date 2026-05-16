# Environment Variables

Load this file when setting up environment variables or diagnosing missing config errors.

## Backend: `src/backend/.env`

Create this file if it doesn't exist:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gregmd
OPENAI_API_KEY=sk-...your-key-here...
API_HOST=0.0.0.0
API_PORT=8089
```

- `DATABASE_URL`: Must match the Docker Compose PostgreSQL config (user: `postgres`, password: `postgres`, db: `gregmd`, port: `5432`)
- `OPENAI_API_KEY`: Required for LLM-based biomarker extraction. Tests that mock the LLM do not need this, but the running app does.

## Frontend: `src/frontend/.env.local`

Create this file if it doesn't exist:

```env
NEXT_PUBLIC_API_URL=http://localhost:8089/api/v1
```

- Must match the backend port exactly. If you change the backend port, update this too.
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose this variable to the browser.

## Verifying Config is Loaded

```powershell
# Check backend sees the DB URL (quick check via alembic)
cd d:\Projects\Programming\greg-md\src\backend
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic current

# Check frontend env is set (visible in Next.js startup output)
# Next.js logs "- Environments: .env.local" when the file is found
```
