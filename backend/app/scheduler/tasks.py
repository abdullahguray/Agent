"""Background task definitions for the 3min work / 3min sleep cycle."""
import asyncio
import logging
from datetime import datetime, timezone
from app.database.supabase import get_supabase
from app.agent.orchestrator import run_scrape_cycle
from app.config import settings

logger = logging.getLogger(__name__)

async def process_config(config: dict):
    try:
        result = await run_scrape_cycle(config)
        logger.info(f"Cycle complete for {config['topic']}: {result['items_scraped']} items")
    except Exception as e:
        logger.error(f"Error processing config {config['id']}: {e}")

async def scrape_cycle():
    supabase = get_supabase()
    result = supabase.table("configurations") \
        .select("*") \
        .eq("status", "active") \
        .execute()

    configs = result.data or []
    if not configs:
        logger.info("No active configurations found")
        return

    logger.info(f"Starting scrape cycle for {len(configs)} config(s)")

    tasks = [process_config(c) for c in configs]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for i, res in enumerate(results):
        if isinstance(res, Exception):
            logger.error(f"Config {configs[i]['id']} failed: {res}")
