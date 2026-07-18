"""
opencode Memory Integration Layer
=================================
This script is called by opencode on startup.
It loads memory context so the AI can recall everything.

Usage:
  python opencode_memory.py --load     (load context for AI)
  python opencode_memory.py --save     (save current state)
  python opencode_memory.py --report   (print memory report)
  python opencode_memory.py --command  (log a command + response)
"""

import sys
import json
import os
from pathlib import Path

MEMORY_DIR = Path(__file__).parent
sys.path.insert(0, str(MEMORY_DIR.parent))
from memory.memory_manager import manager


def cmd_load():
    """Load memory context for AI prompt injection."""
    recent = manager.get_recent_context("active", limit=15)
    session = manager.get_session_summary()
    rules = manager.get_recent_context("rules", limit=5)
    docs = manager.get_recent_context("docs", limit=3)
    report = manager.get_memory_report()

    context = {
        "memory_status": "active",
        "session": session,
        "recent_commands": recent,
        "active_rules": [r.get("data", r) for r in rules],
        "docs": [d.get("data", d) for d in docs],
        "system_report": report
    }

    print("=== MEMORY CONTEXT ===")
    print(json.dumps(context, indent=2, default=str))
    print("=== END MEMORY CONTEXT ===")


def cmd_save():
    """Save current state to memory."""
    state = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "pwd": os.getcwd(),
        "args": sys.argv[2:] if len(sys.argv) > 2 else []
    }
    manager.save_context("state_snapshot", state)
    print(f"State saved at {state['timestamp']}")


def cmd_report():
    """Print memory system report."""
    report = manager.get_memory_report()
    print(json.dumps(report, indent=2))


def cmd_command():
    """Log a command and response. Usage: --command '{"cmd": "...", "response": "..."}'"""
    if len(sys.argv) < 3:
        print("Usage: --command '{\"cmd\": \"...\", \"response\": \"...\"}'")
        return
    try:
        data = json.loads(sys.argv[2])
        manager.log_command(
            command=data.get("cmd", ""),
            response_summary=data.get("response", ""),
            context=data.get("context", {})
        )
        print("Command logged")
    except json.JSONDecodeError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python opencode_memory.py [--load|--save|--report|--command]")
        sys.exit(1)

    command = sys.argv[1]

    if command == "--load":
        cmd_load()
    elif command == "--save":
        cmd_save()
    elif command == "--report":
        cmd_report()
    elif command == "--command":
        cmd_command()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
