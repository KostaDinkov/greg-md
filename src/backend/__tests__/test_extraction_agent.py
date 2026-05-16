"""Tests for the extraction agent module."""

import pytest
from datetime import date
from unittest.mock import Mock, patch
from services.extraction_agent import (
    BiomarkerResult,
    LabExtractionResponse,
    extract_from_pdf,
    _dummy_extraction_response,
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
        result = BiomarkerResult(name="Vitamin D", value=32.5, unit="ng/mL")
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
            results=[BiomarkerResult(name="TSH", value=2.5, unit="mIU/L")],
        )
        assert response.lab_name is None
        assert len(response.results) == 1

    def test_lab_extraction_response_empty_results(self):
        """Test LabExtractionResponse with empty results list."""
        response = LabExtractionResponse(test_date=date(2024, 3, 10), results=[])
        assert len(response.results) == 0


class TestDummyExtraction:
    """Test the dummy extraction mode (USE_DUMMY_LLM=True)."""

    def test_dummy_response_structure(self):
        """Test that the dummy response contains expected fields."""
        response = _dummy_extraction_response()
        assert isinstance(response, LabExtractionResponse)
        assert response.test_date is not None
        assert response.lab_name is not None
        assert len(response.results) > 0

    def test_dummy_response_biomarkers_are_valid(self):
        """Test that dummy biomarkers conform to the schema."""
        response = _dummy_extraction_response()
        for biomarker in response.results:
            assert isinstance(biomarker, BiomarkerResult)
            assert biomarker.name
            assert biomarker.value is not None
            assert biomarker.unit

    @patch("services.extraction_agent.settings")
    def test_extract_from_pdf_uses_dummy_when_flag_is_true(self, mock_settings):
        """Test that extract_from_pdf returns dummy data when use_dummy_llm=True."""
        mock_settings.use_dummy_llm = True
        pdf_bytes = b"%PDF-1.4 fake pdf content"

        result = extract_from_pdf(pdf_bytes)

        assert isinstance(result, LabExtractionResponse)
        assert len(result.results) > 0
        # Verify no real LLM was called by checking known dummy values
        assert result.lab_name == "Demo Diagnostics"

    @patch("services.extraction_agent.settings")
    @patch("services.extraction_agent._get_extraction_agent")
    def test_extract_from_pdf_calls_llm_when_flag_is_false(
        self, mock_get_agent, mock_settings
    ):
        """Test that extract_from_pdf calls the LLM agent when use_dummy_llm=False."""
        mock_settings.use_dummy_llm = False

        mock_agent = Mock()
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
                )
            ],
        )
        mock_agent.run_sync.return_value = mock_result
        mock_get_agent.return_value = mock_agent

        pdf_bytes = b"%PDF-1.4 fake pdf content"
        result = extract_from_pdf(pdf_bytes)

        mock_agent.run_sync.assert_called_once()
        assert result.lab_name == "LabCorp"
        assert len(result.results) == 1
        assert result.results[0].name == "Hemoglobin"

    @patch("services.extraction_agent.settings")
    @patch("services.extraction_agent._get_extraction_agent")
    def test_extract_from_pdf_does_not_call_llm_in_dummy_mode(
        self, mock_get_agent, mock_settings
    ):
        """Test that the real LLM agent is never called when use_dummy_llm=True."""
        mock_settings.use_dummy_llm = True

        pdf_bytes = b"%PDF-1.4 fake pdf content"
        extract_from_pdf(pdf_bytes)

        mock_get_agent.assert_not_called()

    @patch("services.extraction_agent.settings")
    @patch("services.extraction_agent._get_extraction_agent")
    def test_extract_from_pdf_propagates_llm_errors(
        self, mock_get_agent, mock_settings
    ):
        """Test that LLM errors propagate correctly when not in dummy mode."""
        mock_settings.use_dummy_llm = False

        mock_agent = Mock()
        mock_agent.run_sync.side_effect = Exception("LLM API error")
        mock_get_agent.return_value = mock_agent

        pdf_bytes = b"%PDF-1.4 fake pdf content"
        with pytest.raises(Exception, match="LLM API error"):
            extract_from_pdf(pdf_bytes)
