import os
from datetime import date
from pydantic import BaseModel, Field
from pydantic_ai import Agent, BinaryContent
from pydantic_ai.models.openai import OpenAIChatModel
from database import settings


class BiomarkerResult(BaseModel):
    name: str = Field(description="The name of the biomarker, e.g., Hemoglobin, Vitamin D")
    value: float = Field(description="The numerical value extracted")
    unit: str = Field(description="The unit of measurement, e.g., mg/dL, ng/mL")
    reference_range: str | None = Field(default=None, description="The healthy reference range if provided")
    is_flagged: bool | None = Field(default=None, description="True if the value is marked as outside the reference range")


class LabExtractionResponse(BaseModel):
    test_date: date = Field(description="The date the lab test was performed")
    lab_name: str | None = Field(default=None, description="The name of the laboratory, e.g., Quest Diagnostics")
    results: list[BiomarkerResult] = Field(description="List of all extracted biomarkers")


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


if settings.openai_api_key:
    os.environ["OPENAI_API_KEY"] = settings.openai_api_key
else:
    os.environ["OPENAI_API_KEY"] = "sk-dummy-configure-key"

_model = OpenAIChatModel("gpt-4o")

_extraction_agent = Agent(
    _model,
    output_type=LabExtractionResponse,
    system_prompt=(
        "You are an expert medical data extractor. "
        "You will receive a PDF lab report document. "
        "Extract the date of the test and all lab results from the document. "
        "Map them exactly to the provided schema. Do not invent data. "
        "If a unit is missing, try to infer it from standard labs, but prefer null/empty string if unsure."
    ),
)


def extract_from_pdf(pdf_bytes: bytes) -> LabExtractionResponse:
    """Extract structured lab results from raw PDF bytes.

    When USE_DUMMY_LLM is enabled, returns a hardcoded response without calling the LLM.
    Otherwise, sends the PDF directly to a multimodal LLM for extraction.
    """
    if settings.use_dummy_llm:
        return _dummy_extraction_response()

    result = _extraction_agent.run_sync(
        [BinaryContent(data=pdf_bytes, media_type="application/pdf")]
    )
    return result.data
