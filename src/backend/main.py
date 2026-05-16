from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from database import get_session
from config import settings
from models import LabReport, LabResult
from services.extraction_agent import extract_from_pdf
from test_utils import reset_database

app = FastAPI(title="GregMD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.225:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}


@app.delete("/api/v1/test/reset-db")
async def reset_test_database(session: Session = Depends(get_session)):
    """
    Reset the database for test isolation.
    Only available when TEST_MODE is enabled.
    """
    if not settings.test_mode:
        raise HTTPException(
            status_code=403, detail="Database reset is only available in test mode"
        )

    reset_database(session)
    return {"status": "ok", "message": "Database reset successfully"}


async def process_lab_report(report_id: int, file_bytes: bytes, session: Session):
    report = session.get(LabReport, report_id)
    try:
        extraction_data = await extract_from_pdf(file_bytes)

        # Check if we got any results
        if not extraction_data.results or len(extraction_data.results) == 0:
            if report:
                report.status = "failed"
                report.error_message = "We couldn't find any lab results in this document. Please ensure it's a medical lab report with biomarker data."
                session.commit()
            return

        # Save results to DB
        for item in extraction_data.results:
            lab_result = LabResult(
                report_id=report_id,
                biomarker_name=item.name,
                value=item.value,
                unit=item.unit,
                reference_range=item.reference_range,
                is_flagged=item.is_flagged,
                test_date=extraction_data.test_date,
            )
            session.add(lab_result)

        # Update report status
        report.status = "complete"
        session.commit()
    except Exception as e:
        if report:
            report.status = "failed"
            # Log the actual error for debugging
            import logging

            logging.error(
                f"Extraction failed for report {report_id}: {e}", exc_info=True
            )
            # Still show a user-friendly message to the frontend
            report.error_message = "We had trouble processing this report. Please ensure it contains standard lab test results."
            session.commit()


@app.post("/api/v1/labs/upload")
async def upload_lab(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
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

    return {
        "report_id": report.id,
        "status": report.status,
        "message": "File uploaded and processing started.",
    }


@app.get("/api/v1/labs/{report_id}/status")
async def get_lab_status(report_id: int, session: Session = Depends(get_session)):
    report = session.get(LabReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "report_id": report.id,
        "status": report.status,
        "error_message": report.error_message,
    }


@app.get("/api/v1/labs/results", response_model=List[LabResult])
async def get_lab_results(session: Session = Depends(get_session)):
    # Note: In a real app we would filter by user_id
    results = session.exec(select(LabResult).order_by(LabResult.test_date.desc())).all()
    return results


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.api_host, port=settings.api_port, reload=True)
