import threading
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from config import MIN_INTERVAL_SECONDS, SCHEDULE_INTERVAL_SECONDS
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from logger_setup import setup_logger, setup_uvicorn_logger
from process_emails import process_emails

setup_uvicorn_logger()
logger = setup_logger(__name__)

logger.info("App started")

last_run_lock = threading.Lock()
last_run_time = datetime.min


def can_run():
    global last_run_time
    with last_run_lock:
        now = datetime.now()
        if now - last_run_time >= timedelta(seconds=MIN_INTERVAL_SECONDS):
            last_run_time = now
            return True
        return False


def background_scheduler():
    global last_run_time
    while True:
        with last_run_lock:
            since_last = datetime.now() - last_run_time
        if since_last >= timedelta(seconds=SCHEDULE_INTERVAL_SECONDS):
            logger.info("Scheduled run: 15 minutes passed since last execution.")
            if can_run():
                try:
                    process_emails()
                except Exception as e:
                    logger.error(f"Scheduled processing failed: {e}", exc_info=True)
        time.sleep(60)  # check every minute


@asynccontextmanager
async def lifespan(app: FastAPI):
    t = threading.Thread(target=background_scheduler, daemon=True)
    t.start()
    yield


app = FastAPI(lifespan=lifespan)


@app.post("/process")
def trigger_processing():
    if not can_run():
        logger.info("Process called too soon after last run.")
        raise HTTPException(
            status_code=429, detail="Processing can only be triggered once per minute."
        )
    try:
        process_emails()
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        logger.error(f"Manual processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Processing failed.")
