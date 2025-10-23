import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

NATS_URL = os.getenv("NATS_URL", "nats://localhost:4222")
STORAGE_PATH = os.getenv("STORAGE_PATH", "/tmp/uploads")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
