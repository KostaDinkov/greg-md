"""
Script to generate a sample lab report PDF for testing.
Run this script to create a sample PDF in the fixtures directory.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from pathlib import Path

def create_sample_lab_pdf():
    """Create a sample lab report PDF for E2E testing."""
    fixtures_dir = Path(__file__).parent
    output_file = fixtures_dir / "sample-lab-report.pdf"
    
    c = canvas.Canvas(str(output_file), pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "SAMPLE LAB REPORT")
    
    # Test Information
    c.setFont("Helvetica", 12)
    c.drawString(100, 720, "Date: January 15, 2024")
    c.drawString(100, 700, "Patient: Test Patient")
    c.drawString(100, 680, "Lab: Quest Diagnostics")
    c.drawString(100, 660, "Report ID: TEST-2024-001")
    
    # Biomarker Results Section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, 620, "BIOMARKER RESULTS:")
    
    c.setFont("Helvetica", 11)
    y_position = 590
    
    biomarkers = [
        ("Hemoglobin", "15.5", "g/dL", "13.5-17.5", "Normal"),
        ("Vitamin D", "22.0", "ng/mL", "30-100", "LOW"),
        ("Glucose", "95", "mg/dL", "70-100", "Normal"),
        ("Cholesterol (Total)", "210", "mg/dL", "<200", "HIGH"),
        ("TSH", "2.5", "mIU/L", "0.4-4.0", "Normal"),
        ("Vitamin B12", "450", "pg/mL", "200-900", "Normal"),
    ]
    
    for name, value, unit, ref_range, status in biomarkers:
        c.drawString(120, y_position, f"{name}:")
        c.drawString(250, y_position, f"{value} {unit}")
        c.drawString(350, y_position, f"Ref: {ref_range}")
        c.drawString(480, y_position, f"[{status}]")
        y_position -= 25
    
    # Footer
    c.setFont("Helvetica", 9)
    c.drawString(100, 100, "This is a sample lab report generated for testing purposes only.")
    c.drawString(100, 85, "Not for clinical use.")
    
    c.save()
    print(f"Sample lab report PDF created: {output_file}")

if __name__ == "__main__":
    create_sample_lab_pdf()
