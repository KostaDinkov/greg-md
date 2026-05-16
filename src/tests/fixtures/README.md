# Test Fixtures

This directory contains sample files used for testing.

## Files

- `sample-lab-report.pdf`: A sample lab report PDF for E2E testing

To create a sample PDF for testing:

1. Use a PDF creation tool or Python script
2. Include sample biomarker data (e.g., Hemoglobin, Vitamin D, Glucose)
3. Include a test date
4. Save as `sample-lab-report.pdf`

For automated testing, you can create a PDF using Python:

```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_sample_lab_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    c.drawString(100, 750, "SAMPLE LAB REPORT")
    c.drawString(100, 720, "Date: January 15, 2024")
    c.drawString(100, 700, "Patient: Test Patient")
    c.drawString(100, 680, "Lab: Quest Diagnostics")
    c.drawString(100, 640, "BIOMARKER RESULTS:")
    c.drawString(100, 620, "Hemoglobin: 15.5 g/dL (Ref: 13.5-17.5)")
    c.drawString(100, 600, "Vitamin D: 22.0 ng/mL (Ref: 30-100)")
    c.drawString(100, 580, "Glucose: 95 mg/dL (Ref: 70-100)")
    c.drawString(100, 560, "Cholesterol: 210 mg/dL (Ref: <200)")
    c.save()

create_sample_lab_pdf("sample-lab-report.pdf")
```
