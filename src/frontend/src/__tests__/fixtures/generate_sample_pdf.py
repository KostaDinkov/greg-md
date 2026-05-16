"""
Generate a sample lab report PDF for testing.
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os


def generate_sample_lab_pdf(output_path: str):
    """Generate a realistic-looking lab report PDF for testing."""
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, height - 1 * inch, "MEDICAL LABORATORY REPORT")

    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, height - 1.3 * inch, "Test Date: March 15, 2024")
    c.drawString(1 * inch, height - 1.5 * inch, "Lab: Demo Diagnostics")
    c.drawString(1 * inch, height - 1.7 * inch, "Patient: Test Patient")

    # Results table header
    y_position = height - 2.5 * inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1 * inch, y_position, "Test Name")
    c.drawString(3 * inch, y_position, "Result")
    c.drawString(4 * inch, y_position, "Reference Range")
    c.drawString(5.5 * inch, y_position, "Status")

    # Draw line under header
    y_position -= 0.1 * inch
    c.line(1 * inch, y_position, 7 * inch, y_position)

    # Test results
    results = [
        ("Hemoglobin", "14.8 g/dL", "13.5-17.5", "Normal"),
        ("Vitamin D", "18.5 ng/mL", "30-100", "LOW"),
        ("TSH", "2.1 mIU/L", "0.4-4.0", "Normal"),
        ("Cholesterol", "195 mg/dL", "< 200", "Normal"),
        ("Glucose", "92 mg/dL", "70-100", "Normal"),
    ]

    c.setFont("Helvetica", 10)
    y_position -= 0.3 * inch

    for test_name, result, ref_range, status in results:
        c.drawString(1 * inch, y_position, test_name)
        c.drawString(3 * inch, y_position, result)
        c.drawString(4 * inch, y_position, ref_range)

        if status == "LOW" or status == "HIGH":
            c.setFont("Helvetica-Bold", 10)
            c.drawString(5.5 * inch, y_position, status)
            c.setFont("Helvetica", 10)
        else:
            c.drawString(5.5 * inch, y_position, status)

        y_position -= 0.25 * inch

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(
        1 * inch, 1 * inch, "This is a sample lab report for testing purposes only."
    )

    c.save()
    print(f"Sample PDF generated at: {output_path}")


if __name__ == "__main__":
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "sample-lab-report.pdf")

    generate_sample_lab_pdf(output_path)
