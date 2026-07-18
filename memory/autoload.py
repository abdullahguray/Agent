"""
Autoload Script - Kicin openspace kasta oo session ah
=====================================================
This script:
1. Starts the memory background server
2. Loads context from previous sessions
3. Prints memory summary for the AI
4. Logs the session start

Run this at the beginning of every opencode session.
"""

import sys
import os
import json
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from memory.memory_manager import manager
from memory.memory_server import start_server


def main():
    print("=" * 60)
    print("  MEMORY SYSTEM - AUTO LOADING")
    print("=" * 60)

    server_thread = start_server()

    report = manager.get_memory_report()
    session = manager.get_session_summary()

    print(f"\n  Project      : {report.get('project', 'N/A')}")
    print(f"  Session      : {manager.session_id}")
    print(f"  Commands     : {session.get('commands_count', 0)} (previous)")
    print(f"  Active files : {report.get('sections', {}).get('active', {}).get('file_count', 0)}")
    print(f"  Sections     : {report.get('total_sections', 0)}")

    manager.log_command(
        command="SESSION_START",
        response_summary="Memory system loaded successfully",
        context={"action": "autoload", "session_id": manager.session_id}
    )

    print(f"\n  Status: Memory system ready (auto-save every 6s)")
    print("=" * 60)

    return server_thread


if __name__ == "__main__":
    main()
