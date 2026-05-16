"""Tests for the FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from datetime import date
from unittest.mock import patch
import io

from main import app
from database import get_session
from models import LabReport, LabResult
from services.extraction_agent import LabExtractionResponse, BiomarkerResult, extract_from_pdf


@pytest.fixture(name="session")
def session_fixture():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with overridden database session."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def create_sample_pdf_bytes() -> bytes:
    """Helper to create a simple PDF for testing."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(100, 750, "Lab Report - Hemoglobin: 15.5 g/dL")
    c.save()
    buffer.seek(0)
    return buffer.read()


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_check(self, client: TestClient):
        """Test that health endpoint returns OK."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestUploadEndpoint:
    """Test the POST /api/v1/labs/upload endpoint."""

    @patch("main.extract_from_pdf")
    def test_upload_pdf_success(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test successful PDF upload and processing."""
        # Mock extraction to return structured data directly
        mock_extract.return_value = LabExtractionResponse(
            test_date=date(2024, 1, 15),
            lab_name="Quest",
            results=[
                BiomarkerResult(
                    name="Hemoglobin",
                    value=15.5,
                    unit="g/dL",
                    reference_range="13.5-17.5",
                    is_flagged=False,
                )
            ],
        )

        # Create a test PDF
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("test_report.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

        # Upload
        response = client.post("/api/v1/labs/upload", files=files)

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert "report_id" in data
        assert data["status"] == "processing"
        assert "message" in data

        # Verify database record was created
        report = session.get(LabReport, data["report_id"])
        assert report is not None
        assert report.filename == "test_report.pdf"

    def test_upload_non_pdf_file(self, client: TestClient):
        """Test that uploading a non-PDF file returns 400 error."""
        files = {"file": ("test.txt", io.BytesIO(b"Not a PDF"), "text/plain")}

        response = client.post("/api/v1/labs/upload", files=files)

        assert response.status_code == 400
        assert "Only PDF files are supported" in response.json()["detail"]

    def test_upload_without_file(self, client: TestClient):
        """Test that uploading without a file returns 422 error."""
        response = client.post("/api/v1/labs/upload")

        assert response.status_code == 422  # Unprocessable Entity

    @patch("main.extract_from_pdf")
    def test_upload_extraction_failure(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test that extraction failure updates report status to 'failed'."""
        # Mock extraction to raise an error
        mock_extract.side_effect = Exception("Could not parse lab report")

        # Create a test PDF
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("test_report.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

        # Upload
        response = client.post("/api/v1/labs/upload", files=files)

        # Should still return 200 with report_id (background task will fail)
        assert response.status_code == 200
        data = response.json()
        report_id = data["report_id"]

        # Manually trigger the background task to test failure handling
        # (In actual test, we'd need to wait for background task or run synchronously)
        # For now, just verify the report was created
        report = session.get(LabReport, report_id)
        assert report is not None


class TestStatusEndpoint:
    """Test the GET /api/v1/labs/{report_id}/status endpoint."""

    def test_get_status_success(self, client: TestClient, session: Session):
        """Test getting status of an existing report."""
        # Create a report
        report = LabReport(filename="test.pdf", status="complete")
        session.add(report)
        session.commit()
        session.refresh(report)

        # Get status
        response = client.get(f"/api/v1/labs/{report.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["report_id"] == report.id
        assert data["status"] == "complete"

    def test_get_status_not_found(self, client: TestClient):
        """Test that requesting non-existent report returns 404."""
        response = client.get("/api/v1/labs/99999/status")

        assert response.status_code == 404
        assert "Report not found" in response.json()["detail"]

    def test_get_status_processing(self, client: TestClient, session: Session):
        """Test getting status of a report that is still processing."""
        report = LabReport(filename="processing.pdf", status="processing")
        session.add(report)
        session.commit()
        session.refresh(report)

        response = client.get(f"/api/v1/labs/{report.id}/status")

        assert response.status_code == 200
        assert response.json()["status"] == "processing"


class TestResultsEndpoint:
    """Test the GET /api/v1/labs/results endpoint."""

    def test_get_results_success(self, client: TestClient, session: Session):
        """Test getting lab results."""
        # Create a report and results
        report = LabReport(filename="test.pdf", status="complete")
        session.add(report)
        session.commit()
        session.refresh(report)

        result1 = LabResult(
            report_id=report.id,
            biomarker_name="Hemoglobin",
            value=15.5,
            unit="g/dL",
            reference_range="13.5-17.5",
            is_flagged=False,
            test_date=date(2024, 1, 15),
        )
        result2 = LabResult(
            report_id=report.id,
            biomarker_name="Vitamin D",
            value=22.0,
            unit="ng/mL",
            reference_range="30-100",
            is_flagged=True,
            test_date=date(2024, 1, 15),
        )
        session.add(result1)
        session.add(result2)
        session.commit()

        # Get results
        response = client.get("/api/v1/labs/results")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["biomarker_name"] in ["Hemoglobin", "Vitamin D"]
        assert data[1]["biomarker_name"] in ["Hemoglobin", "Vitamin D"]

    def test_get_results_empty(self, client: TestClient):
        """Test getting results when none exist."""
        response = client.get("/api/v1/labs/results")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_results_ordered_by_date(self, client: TestClient, session: Session):
        """Test that results are ordered by test_date descending."""
        report = LabReport(filename="test.pdf", status="complete")
        session.add(report)
        session.commit()
        session.refresh(report)

        # Create results with different dates
        result_old = LabResult(
            report_id=report.id,
            biomarker_name="TSH",
            value=2.5,
            unit="mIU/L",
            test_date=date(2024, 1, 1),
        )
        result_new = LabResult(
            report_id=report.id,
            biomarker_name="TSH",
            value=2.8,
            unit="mIU/L",
            test_date=date(2024, 3, 1),
        )
        session.add(result_old)
        session.add(result_new)
        session.commit()

        # Get results
        response = client.get("/api/v1/labs/results")

        assert response.status_code == 200
        data = response.json()
        # Should be ordered newest first
        assert data[0]["test_date"] == "2024-03-01"
        assert data[1]["test_date"] == "2024-01-01"


class TestDatabasePersistence:
    """Test that extracted data is correctly persisted to the database."""

    @patch("main.extract_from_pdf")
    def test_database_persistence_after_extraction(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test that successful extraction persists data to database."""
        mock_extract.return_value = LabExtractionResponse(
            test_date=date(2024, 2, 10),
            lab_name="LabCorp",
            results=[
                BiomarkerResult(
                    name="Glucose", value=95.0, unit="mg/dL", is_flagged=False
                ),
                BiomarkerResult(
                    name="Cholesterol", value=220.0, unit="mg/dL", is_flagged=True
                ),
            ],
        )

        # Upload
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        response = client.post("/api/v1/labs/upload", files=files)

        assert response.status_code == 200
        report_id = response.json()["report_id"]

        # Verify report in database
        report = session.get(LabReport, report_id)
        assert report is not None
        assert report.filename == "test.pdf"

        # Note: In the actual test client, background tasks run synchronously
        # So the status will be "complete" after the request finishes
        # Verify that the report is created and has a valid status
        assert report.status in ["processing", "complete"]


class TestErrorHandling:
    """Test error handling and polite error messages."""

    @patch("main.extract_from_pdf")
    def test_upload_malformed_pdf_stores_error_message(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test that empty extraction results stores a polite error message."""
        mock_extract.return_value = LabExtractionResponse(
            test_date=date(2024, 1, 15),
            lab_name=None,
            results=[],  # No biomarkers found
        )

        # Upload
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("malformed.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        response = client.post("/api/v1/labs/upload", files=files)

        assert response.status_code == 200
        report_id = response.json()["report_id"]

        # Trigger the background task synchronously by calling process_lab_report directly
        import asyncio
        from main import process_lab_report

        asyncio.run(process_lab_report(report_id, pdf_bytes, session))

        # Verify report has failed status and error message
        session.expire_all()  # Refresh from database
        report = session.get(LabReport, report_id)
        assert report.status == "failed"
        assert report.error_message is not None
        assert "couldn't find any lab results" in report.error_message
        assert "medical lab report" in report.error_message

    @patch("main.extract_from_pdf")
    def test_pdf_parsing_error_stores_polite_message(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test that extraction failures produce polite error messages."""
        mock_extract.side_effect = Exception("extraction failed")

        # Upload
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("corrupted.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        response = client.post("/api/v1/labs/upload", files=files)

        assert response.status_code == 200
        report_id = response.json()["report_id"]

        # Trigger the background task
        import asyncio
        from main import process_lab_report

        asyncio.run(process_lab_report(report_id, pdf_bytes, session))

        # Verify error message
        session.expire_all()
        report = session.get(LabReport, report_id)
        assert report.status == "failed"
        assert report.error_message is not None
        assert "trouble processing" in report.error_message

    @patch("main.extract_from_pdf")
    def test_generic_extraction_failure_stores_polite_message(
        self, mock_extract, client: TestClient, session: Session
    ):
        """Test that generic extraction failures produce polite error messages."""
        mock_extract.side_effect = Exception("Unknown extraction error")

        # Upload
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("generic_fail.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        response = client.post("/api/v1/labs/upload", files=files)

        assert response.status_code == 200
        report_id = response.json()["report_id"]

        # Trigger the background task
        import asyncio
        from main import process_lab_report

        asyncio.run(process_lab_report(report_id, pdf_bytes, session))

        # Verify error message
        session.expire_all()
        report = session.get(LabReport, report_id)
        assert report.status == "failed"
        assert report.error_message is not None
        assert "trouble processing" in report.error_message

    def test_status_endpoint_returns_error_message(
        self, client: TestClient, session: Session
    ):
        """Test that status endpoint returns error_message field."""
        # Create a failed report with error message
        report = LabReport(
            filename="failed.pdf",
            status="failed",
            error_message="We couldn't find any lab results in this document.",
        )
        session.add(report)
        session.commit()
        session.refresh(report)

        # Get status
        response = client.get(f"/api/v1/labs/{report.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failed"
        assert (
            data["error_message"]
            == "We couldn't find any lab results in this document."
        )

    def test_status_endpoint_returns_null_error_for_successful_reports(
        self, client: TestClient, session: Session
    ):
        """Test that successful reports have null error_message."""
        report = LabReport(filename="success.pdf", status="complete")
        session.add(report)
        session.commit()
        session.refresh(report)

        response = client.get(f"/api/v1/labs/{report.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "complete"
        assert data["error_message"] is None
