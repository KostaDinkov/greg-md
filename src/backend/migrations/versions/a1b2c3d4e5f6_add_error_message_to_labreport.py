"""Add error_message to labreport

Revision ID: a1b2c3d4e5f6
Revises: e65bb578983e
Create Date: 2026-05-16 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'e65bb578983e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add error_message column to labreport table."""
    op.add_column('labreport', sa.Column('error_message', sqlmodel.sql.sqltypes.AutoString(), nullable=True))


def downgrade() -> None:
    """Remove error_message column from labreport table."""
    op.drop_column('labreport', 'error_message')
