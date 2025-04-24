from config import NATS_URL
from logger_setup import setup_logger
from nats.aio.client import Client as NATS

# Set up logger for this module
logger = setup_logger(__name__)


class NatsClient:
    def __init__(self, nats_url=NATS_URL):
        self.nats_url = nats_url
        self.nc = NATS()

    async def connect(self):
        await self.nc.connect(self.nats_url)
        logger.info(f"Connected to NATS at {self.nats_url}")

    async def subscribe(self, subject, callback):
        await self.nc.subscribe(subject, cb=callback)
        logger.info(f"Subscribed to subject '{subject}'")

    async def publish(self, subject, message):
        await self.nc.publish(subject, message.encode())
        logger.info(f"Published message to subject '{subject}'")

    async def close(self):
        await self.nc.close()
        logger.info("Closed NATS connection")
