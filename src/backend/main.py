from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from database import get_session
from .config import settings
from models import LabReport, LabResult
from services.pdf_service import PDFService
from services.extraction_agent import extraction_agent

app = FastAPI(title="GregMD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.225:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}

async def process_lab_report(report_id: int, file_bytes: bytes, session: Session):
    try:
        # Extract text
        text = PDFService.extract_text_from_bytes(file_bytes)
        
        # Run AI extraction synchronously in the background task
        # Using pydantic_ai Agent
        result = extraction_agent.run_sync(text)
        extraction_data = result.data
        
        # Save results to DB
        for item in extraction_data.results:
            lab_result = LabResult(
                report_id=report_id,
                biomarker_name=item.name,
                value=item.value,
                unit=item.unit,
                reference_range=item.reference_range,
                is_flagged=item.is_flagged,
                test_date=extraction_data.test_date
            )
            session.add(lab_result)
        
        # Update report status
        report = session.get(LabReport, report_id)
        report.status = "complete"
        session.commit()
    except Exception as e:
        report = session.get(LabReport, report_id)
        if report:
            report.status = "failed"
            session.commit()
        print(f"Extraction failed for report {report_id}: {e}")

@app.post("/api/v1/labs/upload")
async def upload_lab(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    file_bytes = await file.read()
    
    # Create the report record
    report = LabReport(filename=file.filename, status="processing")
    session.add(report)
    session.commit()
    session.refresh(report)
    
    # Kick off background extraction
    background_tasks.add_task(process_lab_report, report.id, file_bytes, session)
    
    return {"report_id": report.id, "status": report.status, "message": "File uploaded and processing started."}

@app.get("/api/v1/labs/{report_id}/status")
async def get_lab_status(report_id: int, session: Session = Depends(get_session)):
    report = session.get(LabReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report_id": report.id, "status": report.status}

@app.get("/api/v1/labs/results", response_model=List[LabResult])
async def get_lab_results(session: Session = Depends(get_session)):
    # Note: In a real app we would filter by user_id
    results = session.exec(select(LabResult).order_by(LabResult.test_date.desc())).all()
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.api_host, port=settings.api_port, reload=True)
