"""
Memory Background Server
========================
Runs continuously in the background.
Auto-saves context every 6 seconds.
Monitors file changes, tracks session state.
"""

import sys
import os
import time
import json
import threading
import logging
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent.parent))
from memory.memory_manager import manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [MEMORY] %(levelname)s: %(message)s"
)
logger = logging.getLogger("MemoryServer")

running = True
cycle_count = 0


def auto_save_loop():
    """Auto-save context every 6 seconds."""
    global cycle_count
    logger.info("Auto-save loop started (6s interval)")

    while running:
        try:
            cycle_count += 1
            now = datetime.now(timezone.utc).isoformat()

            heartbeat = {
                "timestamp": now,
                "cycle": cycle_count,
                "session_id": manager.session_id,
                "status": "alive"
            }
            manager.save_context("heartbeat", heartbeat, "sessions")

            if cycle_count % 10 == 0:
                manager.archive_active(older_hours=24)

            if cycle_count % 600 == 0:
                manager.auto_backup()

            time.sleep(6)
        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Auto-save error: {e}")
            time.sleep(6)


def start_server():
    """Start the memory server in background."""
    server_thread = threading.Thread(target=auto_save_loop, daemon=True)
    server_thread.start()
    logger.info(f"Memory server started | Session: {manager.session_id}")
    return server_thread


if __name__ == "__main__":
    logger.info("=== Memory Server Starting ===")
    logger.info(f"Memory Directory: {Path(__file__).parent}")
    logger.info(f"Project: {manager.config.get('project', 'Unknown')}")
    logger.info(f"Session: {manager.session_id}")

    server_thread = start_server()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down memory server...")
        running = False
        server_thread.join(timeout=5)
        logger.info("Memory server stopped")
