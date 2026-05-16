# Troubleshooting Guide

Load this file when a startup step fails.

## Port Already in Use

**Symptom:** `address already in use` or health check returns wrong service response.

```powershell
# Find what's using the port
docker ps --filter "publish=8089"
netstat -ano | findstr :8089

# Stop the conflicting container
docker stop <container-name>

# Or kill the process (use PID from netstat output)
Stop-Process -Id <PID> -Force
```

## Docker Container Won't Start

**Symptom:** `docker compose up -d` fails or container exits immediately.

```powershell
# Check container logs
docker logs gregmd-postgres

# Full reset (WARNING: deletes database data)
docker compose down -v
docker compose up -d
```

## Database Migration Fails

**Symptom:** `alembic upgrade head` errors out.

```powershell
cd d:\Projects\Programming\greg-md\src\backend

# Check current state
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic current

# Check migration history
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic history

# If DATABASE_URL is wrong, check .env file exists and is correct
# If schema is corrupt, reset (WARNING: data loss)
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic downgrade base
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\python.exe -m alembic upgrade head
```

## Backend Won't Start (Module Not Found)

**Symptom:** `ModuleNotFoundError` when starting uvicorn.

```powershell
# Reinstall dependencies using venv pip directly
d:\Projects\Programming\greg-md\src\backend\.venv\Scripts\pip.exe install -r d:\Projects\Programming\greg-md\src\backend\requirements.txt
```

## Frontend Module Not Found

**Symptom:** `Module not found` in Next.js output.

```powershell
cd d:\Projects\Programming\greg-md\src\frontend

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# Clear Next.js build cache
Remove-Item -Recurse -Force .next
npm run dev
```

## Docker Desktop Not Running

**Symptom:** `docker: command not found` or `Cannot connect to the Docker daemon`.

Start Docker Desktop from the Windows Start menu and wait for it to be fully ready (icon stops animating) before retrying.
