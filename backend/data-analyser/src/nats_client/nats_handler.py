import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from data_analyser.data_analyser import DataAnalyser
from data_analyser.data_average import DataAverage
from data_analyser.exceptions.exceptions import (
    DataAnalyseException,
    DataAverageException,
)
from logger_setup import setup_logger

logger = setup_logger(__name__)


class NatsHandler:
    def __init__(self, nats_client, max_workers=5):
        self.nats_client = nats_client
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.topic_handlers = {
            "analyse.request": self.handle_analyse_request,
            "average.request": self.handle_average_request,
        }

    async def handle_message(self, msg):
        try:
            payload = json.loads(msg.data.decode())
            topic = msg.subject
            handler = self.topic_handlers.get(topic)

            if not handler:
                raise ValueError(f"No handler registered for topic: {topic}")

            logger.info(f"Received message on topic '{topic}'")
            asyncio.create_task(handler(msg, payload))

        except Exception as e:
            logger.error(f"Failed to handle message: {e}", exc_info=True)

    async def handle_analyse_request(self, _, payload):
        try:
            print(payload)
            file_id = payload.get("data").get("id")
            if not file_id:
                raise ValueError("Missing 'id' in message")

            analysis = await self.data_analyser_async(file_id)

            response = json.dumps(
                {
                    "id": file_id,
                    "status": "Success",
                    "message": "Analysis completed successfully.",
                    "analysis": analysis,
                }
            )

            await self.nats_client.publish("analyse.result", response)
            logger.info(f"Replied with result for {file_id}")

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
            logger.warning(
                f"Replied with failed status for analysis of {file_id}: {str(e)}"
            )

        except Exception as e:
            logger.error(f"Analyse error: {e}", exc_info=True)

    async def handle_average_request(self, _, payload):
        try:
            analysis = payload["data"]["analysis"]
            user_id = payload["data"]["id"]
            sha = payload["data"]["analysis_sha"]
            if isinstance(analysis, str):
                analysis = json.loads(analysis)
            if not analysis or not isinstance(analysis, list):
                raise ValueError("Invalid or missing 'analysis' in message")

            average = await self.data_average_async(analysis)

            response = json.dumps(
                {
                    "id": user_id,
                    "analysis_sha": sha,
                    "status": "Success",
                    "message": "Average calculated successfully.",
                    "average": average,
                }
            )

            await self.nats_client.publish("average.result", response)
            logger.info(f"Replied with average result: {average}")

        except DataAverageException as e:
            response = json.dumps(
                {
                    "status": "Failed",
                    "message": str(e),
                }
            )

            await self.nats_client.publish("average.result", response)
            logger.warning(f"Replied with failed status for average request: {str(e)}")

        except Exception as e:
            logger.error(f"Average error: {e}", exc_info=True)

    async def data_analyser_async(self, file_id):
        loop = asyncio.get_event_loop()
        dataAnalyser = await loop.run_in_executor(self.executor, DataAnalyser, file_id)
        return dataAnalyser.result

    async def data_average_async(self, analysis):
        loop = asyncio.get_event_loop()
        dataAverage = await loop.run_in_executor(self.executor, DataAverage, analysis)
        return dataAverage.result
