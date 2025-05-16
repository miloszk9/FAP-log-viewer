import asyncio
import signal

from logger_setup import setup_logger
from nats_client.nats_client import NatsClient
from nats_client.nats_handler import NatsHandler

logger = setup_logger(__name__)


async def main():
    logger.info("Starting data analyser application")
    nats_client = NatsClient()
    await nats_client.connect()
    logger.info("Connected to NATS server")

    nats_handler = NatsHandler(nats_client)
    await nats_client.subscribe("analyse.request", nats_handler.handle_message)
    await nats_client.subscribe("average.request", nats_handler.handle_message)
    logger.info("Subscribed to nats")

    # Create an event for shutdown
    shutdown_event = asyncio.Event()

    # Set up signal handlers
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: shutdown_event.set())

    try:
        # Wait for shutdown signal
        await shutdown_event.wait()
        logger.info("Shutdown signal received, shutting down...")
        await nats_client.close()
        logger.info("NATS client closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}", exc_info=True)
        await nats_client.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Error occurred: {e}", exc_info=True)
