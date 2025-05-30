import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from logger_setup import setup_logger

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
    if os.path.exists("token.json"):
        logger.info("Found existing token.json file")
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    # If credentials are invalid or don't exist, log in again
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            logger.info("Refreshing expired credentials")
            creds.refresh(Request())
        else:
            logger.info("Starting new authentication flow")
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for future runs
        with open("token.json", "w") as token:
            token.write(creds.to_json())
            logger.info("Successfully saved new credentials to token.json")

    # Build Gmail API service
    service = build("gmail", "v1", credentials=creds)
    logger.info("Successfully built Gmail API service")

    return service
