import asyncio
import signal

from nats_client.nats_client import NatsClient
from nats_client.nats_handler import NatsHandler


async def main():
    nats_client = NatsClient()
    await nats_client.connect()

    nats_handler = NatsHandler(nats_client)
    await nats_client.subscribe("analyse.request", nats_handler.handle_message)

    # Create an event for shutdown
    shutdown_event = asyncio.Event()

    # Set up signal handlers
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: shutdown_event.set())

    try:
        # Wait for shutdown signal
        await shutdown_event.wait()
        print("Shutting down...")
        await nats_client.close()
    except Exception as e:
        print(f"Error during shutdown: {e}")
        await nats_client.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Received keyboard interrupt, shutting down...")
    except Exception as e:
        print(f"Error occurred: {e}")
