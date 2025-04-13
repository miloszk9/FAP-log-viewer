import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from data_analyser.data_analyser import DataAnalyser
from nats.aio.client import Client as NATS


class NatsClient:
    def __init__(self, nats_url="nats://localhost:4222", max_workers=5):
        self.nats_url = nats_url
        self.nc = NATS()
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    async def connect(self):
        await self.nc.connect(self.nats_url)
        print(f"🚀 Connected to NATS at {self.nats_url}")

    async def subscribe(self, subject, callback):
        await self.nc.subscribe(subject, cb=callback)
        print(f"🎧 Subscribed to subject '{subject}'")

    async def run_and_reply(self, msg, file_path):
        try:
            result = await self.process_file_async(file_path)

            response = json.dumps(result)

            if msg.reply:
                await self.nc.publish(msg.reply, response.encode())
                print(f"📤 Replied with result for {file_path}")
            else:
                print(f"⚠️ No reply subject provided for {file_path}")

        except Exception as e:
            print(f"❌ Task error: {e}")

    async def process_file_async(self, file_path):
        loop = asyncio.get_event_loop()
        dataAnalyser = await loop.run_in_executor(self.executor, DataAnalyser, file_path)
        return dataAnalyser.result

    async def handle_message(self, msg):
        try:
            data = json.loads(msg.data.decode())
            file_path = data.get("file_path")
            if not file_path:
                raise ValueError("Missing 'file_path' in message")

            print(f"📩 Received task for: {file_path}")

            # Run task in background (non-blocking)
            asyncio.create_task(self.run_and_reply(msg, file_path))

        except Exception as e:
            print(f"❌ Failed to handle message: {e}")
