from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from datetime import date
from database import settings

# Define the expected output schemas based on the spec
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

# Initialize the Pydantic AI agent
# We use OpenAI by default if a key is provided, else it will fail gracefully until configured.
import os

if settings.openai_api_key:
    os.environ["OPENAI_API_KEY"] = settings.openai_api_key
else:
    # Dummy key to allow startup
    os.environ["OPENAI_API_KEY"] = "sk-dummy-configure-key"

model = OpenAIModel('gpt-4o-mini')

extraction_agent = Agent(
    model,
    output_type=LabExtractionResponse,
    system_prompt=(
        "You are an expert medical data extractor. Extract the date of the test and all lab "
        "results from the following text (which is OCR'd from a PDF report). "
        "Map them exactly to the provided schema. Do not invent data. If a unit is missing, try to infer it from standard labs, but prefer null/empty string if unsure."
    ),
)
