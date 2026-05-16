"""Tests for the extraction agent module."""
import pytest
from datetime import date
from unittest.mock import Mock, patch
from services.extraction_agent import (
    BiomarkerResult,
    LabExtractionResponse,
    extraction_agent,
)


class TestBiomarkerResultModel:
    """Test the BiomarkerResult Pydantic model."""

    def test_biomarker_result_valid(self):
        """Test creating a valid BiomarkerResult."""
        result = BiomarkerResult(
            name="Hemoglobin",
            value=15.2,
            unit="g/dL",
            reference_range="13.5-17.5",
            is_flagged=False,
        )
        assert result.name == "Hemoglobin"
        assert result.value == 15.2
        assert result.unit == "g/dL"
        assert result.reference_range == "13.5-17.5"
        assert result.is_flagged is False

    def test_biomarker_result_optional_fields(self):
        """Test BiomarkerResult with optional fields as None."""
        result = BiomarkerResult(
            name="Vitamin D", value=32.5, unit="ng/mL"
        )
        assert result.reference_range is None
        assert result.is_flagged is None

    def test_biomarker_result_missing_required_field(self):
        """Test that missing required fields raise validation error."""
        with pytest.raises(Exception):  # Pydantic ValidationError
            BiomarkerResult(name="Test", value=10.0)  # Missing 'unit'


class TestLabExtractionResponseModel:
    """Test the LabExtractionResponse Pydantic model."""

    def test_lab_extraction_response_valid(self):
        """Test creating a valid LabExtractionResponse."""
        response = LabExtractionResponse(
            test_date=date(2024, 1, 15),
            lab_name="Quest Diagnostics",
            results=[
                BiomarkerResult(
                    name="Glucose", value=95.0, unit="mg/dL", is_flagged=False
                ),
                BiomarkerResult(
                    name="Cholesterol", value=210.0, unit="mg/dL", is_flagged=True
                ),
            ],
        )
        assert response.test_date == date(2024, 1, 15)
        assert response.lab_name == "Quest Diagnostics"
        assert len(response.results) == 2
        assert response.results[0].name == "Glucose"
        assert response.results[1].is_flagged is True

    def test_lab_extraction_response_optional_lab_name(self):
        """Test LabExtractionResponse with optional lab_name as None."""
        response = LabExtractionResponse(
            test_date=date(2024, 2, 20),
            results=[
                BiomarkerResult(name="TSH", value=2.5, unit="mIU/L")
            ],
        )
        assert response.lab_name is None
        assert len(response.results) == 1

    def test_lab_extraction_response_empty_results(self):
        """Test LabExtractionResponse with empty results list."""
        response = LabExtractionResponse(
            test_date=date(2024, 3, 10), results=[]
        )
        assert len(response.results) == 0


class TestExtractionAgent:
    """Test the extraction agent with mocked LLM responses."""

    @patch("services.extraction_agent.extraction_agent.run_sync")
    def test_extraction_agent_success(self, mock_run_sync):
        """Test successful extraction with mocked LLM response."""
        # Mock the LLM response
        mock_result = Mock()
        mock_result.data = LabExtractionResponse(
            test_date=date(2024, 1, 15),
            lab_name="LabCorp",
            results=[
                BiomarkerResult(
                    name="Hemoglobin",
                    value=15.5,
                    unit="g/dL",
                    reference_range="13.5-17.5",
                    is_flagged=False,
                ),
                BiomarkerResult(
                    name="Vitamin D",
                    value=22.0,
                    unit="ng/mL",
                    reference_range="30-100",
                    is_flagged=True,
                ),
            ],
        )
        mock_run_sync.return_value = mock_result

        # Call the agent
        sample_text = "Lab Report\nDate: 01/15/2024\nHemoglobin: 15.5 g/dL"
        result = extraction_agent.run_sync(sample_text)

        # Verify
        assert result.data.test_date == date(2024, 1, 15)
        assert len(result.data.results) == 2
        assert result.data.results[0].name == "Hemoglobin"
        assert result.data.results[1].is_flagged is True
        mock_run_sync.assert_called_once_with(sample_text)

    @patch("services.extraction_agent.extraction_agent.run_sync")
    def test_extraction_agent_missing_fields(self, mock_run_sync):
        """Test extraction with missing optional fields."""
        mock_result = Mock()
        mock_result.data = LabExtractionResponse(
            test_date=date(2024, 2, 10),
            results=[
                BiomarkerResult(
                    name="TSH",
                    value=3.2,
                    unit="mIU/L",
                )
            ],
        )
        mock_run_sync.return_value = mock_result

        sample_text = "TSH: 3.2 mIU/L on 02/10/2024"
        result = extraction_agent.run_sync(sample_text)

        assert len(result.data.results) == 1
        assert result.data.results[0].reference_range is None
        assert result.data.results[0].is_flagged is None

    @patch("services.extraction_agent.extraction_agent.run_sync")
    def test_extraction_agent_invalid_date(self, mock_run_sync):
        """Test that invalid date raises appropriate error."""
        # Simulate an exception from the LLM
        mock_run_sync.side_effect = Exception("Invalid date format")

        sample_text = "Invalid lab report text"
        with pytest.raises(Exception) as exc_info:
            extraction_agent.run_sync(sample_text)

        assert "Invalid date format" in str(exc_info.value)

    @patch("services.extraction_agent.extraction_agent.run_sync")
    def test_extraction_agent_malformed_data(self, mock_run_sync):
        """Test extraction with malformed/incomplete data."""
        mock_run_sync.side_effect = ValueError("Could not parse lab report")

        sample_text = "This is not a lab report"
        with pytest.raises(ValueError) as exc_info:
            extraction_agent.run_sync(sample_text)

        assert "Could not parse lab report" in str(exc_info.value)
