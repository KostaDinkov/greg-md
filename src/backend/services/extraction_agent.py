import os
from datetime import date
from pydantic import BaseModel, Field
from google import genai
from google.genai.types import GenerateContentConfig, Part
from database import settings


class BiomarkerResult(BaseModel):
    name: str = Field(
        description="The name of the biomarker, e.g., Hemoglobin, Vitamin D"
    )
    value: float = Field(description="The numerical value extracted")
    unit: str = Field(description="The unit of measurement, e.g., mg/dL, ng/mL")
    reference_range: str | None = Field(
        default=None, description="The healthy reference range if provided"
    )
    is_flagged: bool | None = Field(
        default=None,
        description="True if the value is marked as outside the reference range",
    )


class LabExtractionResponse(BaseModel):
    test_date: date = Field(description="The date the lab test was performed")
    lab_name: str | None = Field(
        default=None, description="The name of the laboratory, e.g., Quest Diagnostics"
    )
    results: list[BiomarkerResult] = Field(
        description="List of all extracted biomarkers"
    )


def _dummy_extraction_response() -> LabExtractionResponse:
    """Return a hardcoded realistic lab report response for testing without a live LLM."""
    return LabExtractionResponse(
        test_date=date(2024, 3, 15),
        lab_name="Demo Diagnostics",
        results=[
            BiomarkerResult(
                name="Hemoglobin",
                value=14.8,
                unit="g/dL",
                reference_range="13.5-17.5",
                is_flagged=False,
            ),
            BiomarkerResult(
                name="Vitamin D",
                value=18.5,
                unit="ng/mL",
                reference_range="30-100",
                is_flagged=True,
            ),
            BiomarkerResult(
                name="TSH",
                value=2.1,
                unit="mIU/L",
                reference_range="0.4-4.0",
                is_flagged=False,
            ),
        ],
    )


_genai_client = None


def _get_genai_client() -> genai.Client:
    """Lazy-load the Gen AI client to avoid initialization errors during import."""
    global _genai_client

    if _genai_client is None:
        if settings.google_api_key:
            os.environ["GOOGLE_API_KEY"] = settings.google_api_key
        _genai_client = genai.Client()

    return _genai_client


async def extract_from_pdf(pdf_bytes: bytes) -> LabExtractionResponse:
    """Extract structured lab results from raw PDF bytes.

    When USE_DUMMY_LLM is enabled, returns a hardcoded response without calling the LLM.
    Otherwise, sends the PDF directly to a multimodal LLM for extraction.
    """
    if settings.use_dummy_llm:
        return _dummy_extraction_response()

    client = _get_genai_client()

    # Create the system prompt
    system_instruction = (
        "You are an expert medical data extractor. "
        "You will receive a PDF lab report document. "
        "Extract the date of the test and all lab results from the document. "
        "Return the data as JSON with this exact schema:\n"
        "{\n"
        '  "test_date": "YYYY-MM-DD",\n'
        '  "lab_name": "Laboratory Name or null",\n'
        '  "results": [\n'
        "    {\n"
        '      "name": "Biomarker name",\n'
        '      "value": numeric_value,\n'
        '      "unit": "unit of measurement",\n'
        '      "reference_range": "range or null",\n'
        '      "is_flagged": true/false/null\n'
        "    }\n"
        "  ]\n"
        "}\n"
        "Do not invent data. If a unit is missing, try to infer it from standard labs, "
        "but prefer null if unsure."
    )

    # Call the API with the PDF
    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=[
            system_instruction,
            Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
        ],
        config=GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )

    # Parse the JSON response
    import json

    result_data = json.loads(response.text)

    # Convert to our Pydantic model
    return LabExtractionResponse(**result_data)
