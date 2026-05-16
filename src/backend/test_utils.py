"""
Test utilities for database reset and test isolation.
"""

from sqlmodel import Session, delete
from models import LabReport, LabResult


def reset_database(session: Session) -> None:
    """
    Reset the database by deleting all lab-related data.
    This is used for test isolation to ensure each test starts with a clean slate.

    WARNING: This should only be called in test mode.
    """
    # Delete in correct order to respect foreign key constraints
    session.exec(delete(LabResult))
    session.exec(delete(LabReport))
    session.commit()
