from attachment_processor import process_attachments
from auth import authenticate
from config import ENV
from email_handler import check_unread_emails, get_message_data, mark_as_read
from logger_setup import setup_logger

# Set up logger with file output
logger = setup_logger(__name__)


def process_emails():
    service = authenticate()
    logger.info("Checking for unread emails...")
    messages = check_unread_emails(service)

    for msg in messages:
        logger.info(f"Processing message {msg['id']}")
        msg_data = get_message_data(service, msg["id"])
        if msg_data:
            try:
                process_attachments(msg_data, service)
                if ENV == "production":
                    mark_as_read(service, msg["id"])
            except Exception as e:
                logger.error(
                    f"Error processing message {msg['id']}: {e}", exc_info=True
                )
