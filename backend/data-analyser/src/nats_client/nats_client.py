from nats.aio.client import Client as NATS
from config import NATS_URL


class NatsClient:
    def __init__(self, nats_url=NATS_URL):
        self.nats_url = nats_url
        self.nc = NATS()

    async def connect(self):
        await self.nc.connect(self.nats_url)
        print(f"🚀 Connected to NATS at {self.nats_url}")

    async def subscribe(self, subject, callback):
        await self.nc.subscribe(subject, cb=callback)
        print(f"🎧 Subscribed to subject '{subject}'")

    async def publish(self, subject, message):
        await self.nc.publish(subject, message.encode())
        print(f"📤 Published message to subject '{subject}'")
