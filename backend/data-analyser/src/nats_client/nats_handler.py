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
            "analysis.request": self.handle_analysis_request,
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

    async def handle_analysis_request(self, _, payload):
        logger.debug(f"Received analysis request: {payload}")
        try:
            file_id = payload.get("data", {}).get("fileName")
            if not file_id:
                raise ValueError("Missing 'fileName' in message")

            analysis = await self.data_analyser_async(file_id)

            fap_regen = bool(analysis.get("fapRegen"))
            date = analysis.get("overall", {}).get("date", {}).get("date")
            distance = analysis.get("overall", {}).get("distance_km")

            response = json.dumps(
                {
                    "analysisId": file_id,
                    "status": "Success",
                    "message": "Analysis completed successfully.",
                    "analysis": analysis,
                    "fapRegen": fap_regen,
                    "logDate": date,
                    "distance": distance,
                }
            )

            await self.nats_client.publish("analysis.result", response)
            logger.info(f"Replied with result for {file_id}")

        except DataAnalyseException as e:
            await self._publish_analysis_failure(file_id, str(e))
            logger.warning(
                f"Replied with failed status for analysis of {file_id}: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Analysis error: {e}", exc_info=True)
            await self._publish_analysis_failure(file_id, str(e))

    async def handle_average_request(self, _, payload):
        logger.debug(f"Received average request: {payload}")
        try:
            payload = payload["data"]
            user_id = payload["userId"]
            sha = payload["analysisSha"]
            analysis = self._ensure_analysis_list(payload["analysis"])

            average = await self.data_average_async(analysis)

            response = json.dumps(
                {
                    "userId": user_id,
                    "analysisSha": sha,
                    "status": "SUCCESS",
                    "message": "Average calculated successfully.",
                    "average": average,
                }
            )

            await self.nats_client.publish("average.result", response)
            logger.info(f"Replied with average result for user {user_id}")

        except DataAverageException as e:
            await self._publish_average_failure(user_id, sha, str(e))
            logger.warning(f"Replied with failed status for average request: {str(e)}")
        except Exception as e:
            logger.error(f"Average error: {e}", exc_info=True)
            await self._publish_average_failure(user_id, sha, str(e))

    async def data_analyser_async(self, file_id):
        loop = asyncio.get_event_loop()
        dataAnalyser = await loop.run_in_executor(self.executor, DataAnalyser, file_id)
        return dataAnalyser.result

    async def data_average_async(self, analysis):
        loop = asyncio.get_event_loop()
        dataAverage = await loop.run_in_executor(self.executor, DataAverage, analysis)
        return dataAverage.result

    async def _publish_analysis_failure(self, analysis_id, message):
        response = json.dumps(
            {
                "analysisId": analysis_id,
                "status": "Failed",
                "message": message,
                "analysis": {},
                "fapRegen": False,
                "logDate": None,
                "distance": None,
            }
        )

        await self.nats_client.publish("analysis.result", response)

    @staticmethod
    def _ensure_analysis_list(raw_analysis):
        if raw_analysis is None:
            raise ValueError("Missing 'analysis' in message")

        if isinstance(raw_analysis, str):
            raw_analysis = json.loads(raw_analysis)

        if not isinstance(raw_analysis, list) or not raw_analysis:
            raise ValueError("Invalid or empty 'analysis' in message")

        return raw_analysis

    async def _publish_average_failure(self, user_id, sha, message):
        response = json.dumps(
            {
                "userId": user_id,
                "analysisSha": sha,
                "status": "FAILED",
                "message": message,
                "average": {},
            }
        )

        await self.nats_client.publish("average.result", response)
