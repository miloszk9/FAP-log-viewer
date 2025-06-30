import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from setup.config import CREDENTIAL_JSON_PATH, ENV, TOKEN_PATH
from setup.logger_setup import setup_logger

logger = setup_logger(__name__)

# Scope: Read and modify Gmail access
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
]


def authenticate():
    """Authenticate user and return Gmail API service."""
    creds = None
    # Token stores user's access and refresh tokens
    if os.path.exists(TOKEN_PATH):
        logger.info("Found existing token.json file")
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # If credentials are invalid or don't exist, log in again
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            logger.info("Refreshing expired credentials")
            creds.refresh(Request())
        else:
            if ENV == "production":
                logger.error(
                    "No valid credentials found. Please generate token.json first by running the script locally"
                )
                raise Exception(
                    "Missing valid credentials. Generate token.json first by running the script locally"
                )
            logger.info("Starting new authentication flow")
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIAL_JSON_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save the credentials for future runs
        if ENV != "production":
            with open(TOKEN_PATH, "w") as token:
                token.write(creds.to_json())
                logger.info("Successfully saved new credentials to token.json")

    # Build Gmail API service
    service = build("gmail", "v1", credentials=creds)
    logger.info("Successfully built Gmail API service")

    return service
