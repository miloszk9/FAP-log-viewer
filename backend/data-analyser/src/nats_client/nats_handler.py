import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from data_analyser.data_analyser import DataAnalyser
from data_analyser.exceptions.exceptions import DataAnalyseException


class NatsHandler:
    def __init__(self, nats_client, max_workers=5):
        self.nats_client = nats_client
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    async def handle_message(self, msg):
        try:
            payload = json.loads(msg.data.decode())
            file_id = payload["data"].get("id")
            if not file_id:
                raise ValueError("Missing 'id' in message")

            print(f"📩 Received task for: {file_id}")

            # Run task in background (non-blocking)
            asyncio.create_task(self.run_and_reply(msg, file_id))

        except Exception as e:
            print(f"❌ Failed to handle message: {e}")

    async def run_and_reply(self, msg, file_id):
        try:
            analysis = await self.process_file_async(file_id)

            response = json.dumps(
                {
                    "id": file_id,
                    "status": "Success",
                    "message": "Analysis completed successfully.",
                    "analysis": analysis,
                }
            )

            await self.nats_client.publish("analyse.result", response)
            print(f"📤 Replied with result for {file_id}")

        except DataAnalyseException as e:
            response = json.dumps(
                {
                    "id": file_id,
                    "status": "Failed",
                    "message": str(e),
                    "analysis": {},
                }
            )

            await self.nats_client.publish("analyse.result", response)
            print(f"⚠️ Replied with failed status for {file_id}")

        except Exception as e:
            print(f"❌ Task error: {e}")

    async def process_file_async(self, file_id):
        loop = asyncio.get_event_loop()
        dataAnalyser = await loop.run_in_executor(self.executor, DataAnalyser, file_id)
        return dataAnalyser.result
