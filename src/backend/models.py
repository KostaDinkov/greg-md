from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date


class LabReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    status: str = Field(default="processing")  # processing, complete, failed
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    results: List["LabResult"] = Relationship(back_populates="report")


class LabResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="labreport.id")
    biomarker_name: str
    value: float
    unit: str
    reference_range: Optional[str] = None
    is_flagged: Optional[bool] = None
    test_date: date
    report: LabReport = Relationship(back_populates="results")
