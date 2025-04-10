"""changed column name 'is_revoked' to 'deleted' in token table

Revision ID: 6d174a851bf2
Revises: 3d1c82503a66
Create Date: 2025-04-10 22:44:29.750823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6d174a851bf2'
down_revision: Union[str, None] = '3d1c82503a66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('refresh_tokens', sa.Column('deleted', sa.Boolean(), nullable=True))
    op.alter_column('refresh_tokens', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True)
    op.alter_column('refresh_tokens', 'expires_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True)
    op.drop_column('refresh_tokens', 'is_revoked')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('refresh_tokens', sa.Column('is_revoked', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.alter_column('refresh_tokens', 'expires_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True)
    op.alter_column('refresh_tokens', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True)
    op.drop_column('refresh_tokens', 'deleted')
    # ### end Alembic commands ###
