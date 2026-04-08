from app.main import app
from app.models.ai import OCRItem, OCRResult

# This shim exists to support legacy deployment configurations 
# that expect a server.py file as the entry point.
# It also exports common models that tests might still import from here.
