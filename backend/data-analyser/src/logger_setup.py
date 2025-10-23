import logging
import sys

from config import LOG_LEVEL


def setup_logger(name):
    logger = logging.getLogger(name)

    # If logger already has handlers, don't add new ones
    if logger.handlers:
        return logger

    logger.setLevel(LOG_LEVEL)

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(LOG_LEVEL)

    # Add handler to logger
    logger.addHandler(console_handler)

    return logger
