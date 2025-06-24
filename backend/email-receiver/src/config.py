import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
CREDENTIAL_JSON_PATH = os.getenv("CREDENTIAL_JSON_PATH", "./credentials.json")
ENV = os.getenv("ENV", "development")
MIN_INTERVAL_SECONDS = int(os.getenv("MIN_INTERVAL_SECONDS", "60"))
SCHEDULE_INTERVAL_SECONDS = int(os.getenv("SCHEDULE_INTERVAL_SECONDS", "900"))
TOKEN_PATH = os.getenv("TOKEN_PATH", "./token.json")
