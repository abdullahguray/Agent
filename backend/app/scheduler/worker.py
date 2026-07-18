"""Worker that manages the 3min work / 3min sleep cycle."""
import asyncio
import logging
import signal
from app.scheduler.tasks import scrape_cycle
from app.config import settings

logger = logging.getLogger(__name__)

running = True

def handle_shutdown(sig, frame):
    global running
    logger.info("Shutdown signal received")
    running = False

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

async def run_worker():
    logger.info(f"Worker started: {settings.work_minutes}min work / {settings.sleep_minutes}min sleep cycle")

    while running:
        work_seconds = settings.work_minutes * 60
        sleep_seconds = settings.sleep_minutes * 60

        logger.info(f"[WORK] Starting {settings.work_minutes}min work phase")
        try:
            await asyncio.wait_for(
                scrape_cycle(),
                timeout=work_seconds
            )
        except asyncio.TimeoutError:
            logger.info("Work phase timed out (max duration reached)")
        except Exception as e:
            logger.error(f"Work phase error: {e}")

        if not running:
            break

        logger.info(f"[SLEEP] Starting {settings.sleep_minutes}min sleep phase")
        try:
            await asyncio.sleep(sleep_seconds)
        except asyncio.CancelledError:
            break

    logger.info("Worker stopped")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_worker())
