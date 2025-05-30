import base64

import requests
from config import BACKEND_URL
from logger_setup import setup_logger

logger = setup_logger(__name__)


def get_attachment_data(service, message_id, attachment_id):
    """Get attachment data from Gmail message."""
    try:
        attachment = (
            service.users()
            .messages()
            .attachments()
            .get(userId="me", messageId=message_id, id=attachment_id)
            .execute()
        )

        if attachment and "data" in attachment:
            return base64.urlsafe_b64decode(attachment["data"])
        return None
    except Exception as e:
        logger.error(f"Error getting attachment: {e}", exc_info=True)
        return None


def send_file_to_endpoint(filename, file_data, email):
    """Send file to the local endpoint."""
    try:
        files = {"file": (filename, file_data)}
        data = {"email": email}

        logger.info(
            f"Sending POST request with {filename} from {email}",
        )

        response = requests.post(f"{BACKEND_URL}/email", files=files, data=data)

        if response.status_code == 201:
            logger.info(f"Successfully processed {filename} from {email}")
            return True
        else:
            logger.error(
                f"Failed to process {filename} from {email}: {response.status_code}"
            )
            return False
    except Exception as e:
        logger.error(f"Error sending to local endpoint: {e}", exc_info=True)
        return False


def process_attachments(msg_data, service):
    """Process attachments from a message and send them to the local endpoint."""
    try:
        # Get sender email from headers
        headers = msg_data.get("payload", {}).get("headers", [])
        sender = next((h["value"] for h in headers if h["name"] == "From"), None)

        if not sender:
            raise ValueError("Unknown sender - no From header found in email")

        # Extract email from sender string (e.g., "John Doe <john@example.com>")
        email = sender.split("<")[-1].split(">")[0] if "<" in sender else sender

        # Process attachments
        if "payload" in msg_data and "parts" in msg_data["payload"]:
            for part in msg_data["payload"]["parts"]:
                if (
                    part.get("filename")
                    and part.get("body")
                    and part.get("body").get("attachmentId")
                ):
                    filename = part["filename"].lower()
                    if filename.endswith((".csv", ".zip")):
                        logger.info(f"Processing attachment: {filename}")

                        # Get attachment data
                        attachment_data = get_attachment_data(
                            service, msg_data["id"], part["body"]["attachmentId"]
                        )

                        if attachment_data:
                            send_file_to_endpoint(filename, attachment_data, email)

    except Exception as e:
        logger.error(f"Error processing attachments: {e}", exc_info=True)
        raise
