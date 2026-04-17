from app.main import app  # noqa: F401
from app.models.ai import OCRItem, OCRResult  # noqa: F401

# This shim exists to support legacy deployment configurations
# that expect a server.py file as the entry point.
# It also exports common models that tests might still import from here.
