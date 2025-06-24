from logger_setup import setup_logger

logger = setup_logger(__name__)


def mark_as_read(service, message_id):
    """Mark a message as read by removing the UNREAD label."""
    try:
        request = (
            service.users()
            .messages()
            .modify(userId="me", id=message_id, body={"removeLabelIds": ["UNREAD"]})
        )
        request.execute(num_retries=3)
        logger.info(f"Message {message_id} marked as read")
    except Exception as e:
        logger.error(f"Error marking message as read: {e}", exc_info=True)


def check_unread_emails(service):
    """Check for unread emails and process attachments."""
    try:
        request = (
            service.users()
            .messages()
            .list(userId="me", labelIds=["UNREAD"], maxResults=25)
        )
        results = request.execute(num_retries=3)

        messages = results.get("messages", [])

        if not messages:
            logger.info("No unread messages.")
            return []
        else:
            logger.info(f"Found {len(messages)} unread message(s)")
            return messages

    except Exception as e:
        logger.error(
            f"An error occurred while checking unread emails: {e}", exc_info=True
        )
        return []


def get_message_data(service, message_id):
    """Get full message data from Gmail."""
    try:
        return (
            service.users()
            .messages()
            .get(userId="me", id=message_id, format="full")
            .execute()
        )
    except Exception as e:
        logger.error(f"Error getting message data: {e}", exc_info=True)
        return None
