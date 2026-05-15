import pypdf
from pathlib import Path
import io

class PDFService:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """Extract text from a PDF file provided as bytes."""
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text

    @staticmethod
    def extract_text_from_file(file_path: str | Path) -> str:
        """Extract text from a PDF file on disk."""
        with open(file_path, "rb") as f:
            return PDFService.extract_text_from_bytes(f.read())
