from typing import Any, Dict


class UniqueConstraintException(Exception):
    def __init__(self, fields: Dict[str, Any], message: str = None):
        if message is None:
            message = f"Unique constraint violation for fields: {fields}"
        self.fields = fields
        self.message = message
        super().__init__(self.message)
