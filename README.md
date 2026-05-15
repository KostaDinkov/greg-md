# Greg-md

## Introduction
Greg-md is a personal health assistant application that allows users to track their health metrics and receive personalized health recommendations, explore data through charts and other visualizations, and receive insights and suggestions to improve their health.

## Features
- User authentication and authorization
- Health metrics tracking
- Automatic lab report data extraction and analysis from pdf and image files using AI models
- Health recommendations
- Data visualization
- Health insights and suggestions
- Automated data updates from wearables and health apps
- Automatic report generation and sharing
- Multi-language support
- Export data to PDF, CSV, and other formats    
## Getting Started

### Local Development

1. **Prerequisites**:
   - Docker Desktop (for PostgreSQL)
   - Python 3.10+
   - Node.js 18+

2. **Setup**:
   - Backend: `cd src/backend && python -m venv .venv && .\.venv\Scripts\activate && pip install -r requirements.txt`
   - Frontend: `cd src/frontend && npm install`

3. **Run the system**:
   - In the root directory, run the PowerShell startup script:
     ```powershell
     .\run.ps1
     ```
   - This will start the database in Docker and launch the backend and frontend in new terminal windows.

## Configuration

- **Backend**: Configure via `src/backend/.env`. You can set `API_PORT` if 8000 is occupied.
- **Frontend**: Configure via `src/frontend/.env.local`. Ensure `NEXT_PUBLIC_API_URL` matches your backend address.
