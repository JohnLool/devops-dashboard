"""deleted column added to server table

Revision ID: d7330b16f8fc
Revises: 07a2430fdf94
Create Date: 2025-02-18 22:19:34.272983

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7330b16f8fc'
down_revision: Union[str, None] = '07a2430fdf94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('servers', sa.Column('deleted', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('servers', 'deleted')
    # ### end Alembic commands ###
