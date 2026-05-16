"""Tests for the PDF service module."""

import pytest
from pathlib import Path
import io
from pypdf import PdfWriter
from services.pdf_service import PDFService


class TestPDFService:
    """Test the PDFService for text extraction."""

    def create_sample_pdf_bytes(self, text_content: str) -> bytes:
        """Helper to create a simple PDF with text content."""
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.drawString(100, 750, text_content)
        c.save()
        buffer.seek(0)
        return buffer.read()

    def test_extract_text_from_bytes_success(self):
        """Test successful text extraction from PDF bytes."""
        # Create a simple PDF
        text_content = "Lab Report - Hemoglobin: 15.5 g/dL"
        pdf_bytes = self.create_sample_pdf_bytes(text_content)

        # Extract text
        extracted_text = PDFService.extract_text_from_bytes(pdf_bytes)

        # Verify
        assert text_content in extracted_text
        assert len(extracted_text) > 0

    def test_extract_text_from_bytes_empty_pdf(self):
        """Test extraction from an empty PDF."""
        # Create an empty PDF
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)

        buffer = io.BytesIO()
        writer.write(buffer)
        buffer.seek(0)
        pdf_bytes = buffer.read()

        # Extract text
        extracted_text = PDFService.extract_text_from_bytes(pdf_bytes)

        # Should return empty or whitespace-only string
        assert len(extracted_text.strip()) == 0

    def test_extract_text_from_bytes_multi_page(self):
        """Test extraction from a multi-page PDF."""
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)

        # Page 1
        c.drawString(100, 750, "Page 1: Hemoglobin: 15.5 g/dL")
        c.showPage()

        # Page 2
        c.drawString(100, 750, "Page 2: Glucose: 95 mg/dL")
        c.save()

        buffer.seek(0)
        pdf_bytes = buffer.read()

        # Extract text
        extracted_text = PDFService.extract_text_from_bytes(pdf_bytes)

        # Verify both pages are extracted
        assert "Page 1" in extracted_text or "Hemoglobin" in extracted_text
        assert "Page 2" in extracted_text or "Glucose" in extracted_text

    def test_extract_text_from_bytes_corrupted_pdf(self):
        """Test error handling for corrupted PDF bytes."""
        corrupted_bytes = b"This is not a valid PDF file"

        with pytest.raises(Exception):  # pypdf will raise an error
            PDFService.extract_text_from_bytes(corrupted_bytes)

    def test_extract_text_from_bytes_non_pdf(self):
        """Test error handling for non-PDF file."""
        non_pdf_bytes = b"%!PS-Adobe-3.0\nThis is a PostScript file"

        with pytest.raises(Exception):
            PDFService.extract_text_from_bytes(non_pdf_bytes)

    def test_extract_text_from_file_success(self, tmp_path):
        """Test successful text extraction from a PDF file on disk."""
        # Create a sample PDF file
        text_content = "Test Lab Report - TSH: 2.5 mIU/L"
        pdf_bytes = self.create_sample_pdf_bytes(text_content)

        pdf_file = tmp_path / "test_report.pdf"
        pdf_file.write_bytes(pdf_bytes)

        # Extract text
        extracted_text = PDFService.extract_text_from_file(str(pdf_file))

        # Verify
        assert text_content in extracted_text
        assert len(extracted_text) > 0

    def test_extract_text_from_file_not_found(self):
        """Test error handling for non-existent file."""
        with pytest.raises(FileNotFoundError):
            PDFService.extract_text_from_file("/path/to/nonexistent.pdf")

    def test_extract_text_from_file_pathlib(self, tmp_path):
        """Test extraction using pathlib.Path object."""
        text_content = "Pathlib Test - Vitamin D: 32 ng/mL"
        pdf_bytes = self.create_sample_pdf_bytes(text_content)

        pdf_file = tmp_path / "pathlib_test.pdf"
        pdf_file.write_bytes(pdf_bytes)

        # Extract text using Path object
        extracted_text = PDFService.extract_text_from_file(pdf_file)

        # Verify
        assert text_content in extracted_text
