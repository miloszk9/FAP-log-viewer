import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from data_analyser.data_analyser import DataAnalyser


class NatsHandler:
    def __init__(self, nats_client, max_workers=5):
        self.nats_client = nats_client
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

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

    async def run_and_reply(self, msg, file_path):
        try:
            result = await self.process_file_async(file_path)

            response = json.dumps(result)

            if msg.reply:
                await self.nats_client.publish(msg.reply, response)
                print(f"📤 Replied with result for {file_path}")
            else:
                print(f"⚠️ No reply subject provided for {file_path}")

        except Exception as e:
            print(f"❌ Task error: {e}")

    async def process_file_async(self, file_path):
        loop = asyncio.get_event_loop()
        dataAnalyser = await loop.run_in_executor(
            self.executor, DataAnalyser, file_path
        )
        return dataAnalyser.result
