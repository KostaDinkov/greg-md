# Startup script for GregMD

Write-Host "🚀 Starting GregMD Local Environment..." -ForegroundColor Cyan

# 1. Start Database
Write-Host "📦 Starting Database container..." -ForegroundColor Yellow
docker-compose up -d db

# 2. Start Backend
Write-Host "🐍 Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/backend; .\.venv\Scripts\python.exe main.py"

# 3. Start Frontend
Write-Host "⚛️ Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/frontend; npm run dev"

Write-Host "✅ System startup initiated!" -ForegroundColor Green
Write-Host "Backend:"  -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
