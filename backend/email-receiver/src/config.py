import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
