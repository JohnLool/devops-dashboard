"""unique constraint added to container model, docker_id is not unique now

Revision ID: 8d583e8cbce5
Revises: 117ab3b048a1
Create Date: 2025-03-07 14:49:14.255560

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d583e8cbce5'
down_revision: Union[str, None] = '117ab3b048a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('containers_docker_id_key', 'containers', type_='unique')
    op.create_unique_constraint('uq_server_container_name', 'containers', ['server_id', 'name'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('uq_server_container_name', 'containers', type_='unique')
    op.create_unique_constraint('containers_docker_id_key', 'containers', ['docker_id'])
    # ### end Alembic commands ###
