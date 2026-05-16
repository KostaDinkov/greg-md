---
name: project-setup
description: >
  Start all project services for local development and verify the stack is
  running. Use this skill when asked to start the project, run the app, set up
  the dev environment, start Docker, start the backend, start the frontend, or
  troubleshoot service startup failures.
compatibility: Windows (PowerShell). Requires Docker Desktop, Python 3.11+ venv at src/backend/.venv, Node.js 18+.
---

# Project Setup

Start all services in this order. Each step must succeed before proceeding.

## 1. Docker (PostgreSQL)

```powershell
cd d:\Projects\Programming\greg-md
docker compose up -d
docker ps --filter "name=gregmd-postgres" --format "{{.Status}}"
```

Expected: `Up X seconds` or `Up X minutes`

## 2. Database Migrations

```powershell
cd d:\Projects\Programming\greg-md\src\backend
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic upgrade head
```

Expected: `Running upgrade ... -> ..., <message>` or `INFO  [alembic.runtime.migration] Running upgrade` lines, then no error.

## 3. Backend API

Run in a persistent terminal (stays running):

```powershell
cd d:\Projects\Programming\greg-md\src\backend
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8089
```

Expected: `Application startup complete.`

Verify: `Invoke-WebRequest -Uri "http://localhost:8089/api/v1/health" -UseBasicParsing`  
Expected response: `{"status":"ok"}`

## 4. Frontend

Run in a second persistent terminal (stays running):

```powershell
cd d:\Projects\Programming\greg-md\src\frontend
npm run dev
```

Expected: `✓ Ready in X.Xs` and `Local: http://localhost:3000`

## Health Check (all at once)

```powershell
docker ps --filter "name=gregmd-postgres" --format "Status: {{.Status}}"
Invoke-WebRequest -Uri "http://localhost:8089/api/v1/health" -UseBasicParsing | Select-Object StatusCode, Content
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode
```

All three must return success for the project to be operational.

## Gotchas

- **Do not use** `.\.venv\Scripts\Activate.ps1` — use the full absolute path to `python.exe` inside `.venv` instead. The activation script fails when cwd is not `src/backend`.
- **docker-compose vs docker compose**: Use `docker compose` (v2, no hyphen). `docker-compose` (v1) may not be installed.
- **Container name**: The PostgreSQL container is `gregmd-postgres`. Health checks using other names will return no output.
- **Port 8089 conflict**: Run `docker ps --filter "publish=8089"` before starting the backend. Other containers (e.g., BakeryOps) may be occupying the port. Stop them first: `docker stop <name>`.
- **Health endpoint path**: Backend health is at `/api/v1/health`, not `/health`. The root path may serve a different service if port 8089 is shared.
- **Migration location**: Run alembic from `src/backend/`, not the project root. `alembic.ini` is in `src/backend/`.

## Troubleshooting

See `references/troubleshooting.md` if a step fails. Common issues: port conflicts, Docker not running, migration errors, missing env vars.

## Environment Variables

See `references/env-vars.md` for required environment variables. Both `.env` (backend) and `.env.local` (frontend) must exist before starting services.
