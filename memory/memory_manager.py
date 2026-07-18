"""
Memory Manager - Persistent Memory System
=========================================
Central hub for all memory operations.
Auto-saves context, tracks commands, manages sections.
"""

import json
import os
import time
import shutil
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MemoryManager")

MEMORY_DIR = Path(__file__).parent
CONFIG_PATH = MEMORY_DIR / "memory_config.json"
INDEX_PATH = MEMORY_DIR / "index.json"


class MemoryManager:
    def __init__(self):
        self.config = self._load_json(CONFIG_PATH, {})
        self.index = self._load_json(INDEX_PATH, {})
        self.session_id = self._generate_session_id()
        self._init_session()

    def _load_json(self, path: Path, default):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def _save_json(self, path: Path, data):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _generate_session_id(self) -> str:
        return datetime.now(timezone.utc).strftime("session_%Y%m%d_%H%M%S")

    def _init_session(self):
        now = datetime.now(timezone.utc).isoformat()
        session_info = {
            "session_id": self.session_id,
            "started_at": now,
            "last_activity": now,
            "commands_count": 0,
            "files_modified": [],
            "state_summary": "Session started"
        }
        self._save_to_section("sessions", f"{self.session_id}.json", session_info)
        self._update_index("sessions", 1)
        logger.info(f"Session initialized: {self.session_id}")

    def _update_index(self, section: str, delta: int = 0):
        if "sections" not in self.index:
            self.index["sections"] = {}
        if section not in self.index["sections"]:
            self.index["sections"][section] = {"file_count": 0, "last_access": ""}
        self.index["sections"][section]["file_count"] += delta
        self.index["sections"][section]["last_access"] = datetime.now(timezone.utc).isoformat()
        self.index["last_updated"] = datetime.now(timezone.utc).isoformat()
        self._save_json(INDEX_PATH, self.index)

    def _get_section_path(self, section: str) -> Path:
        return MEMORY_DIR / self.config.get("sections", {}).get(section, {}).get("path", f"sections/{section}")

    def _save_to_section(self, section: str, filename: str, data):
        section_path = self._get_section_path(section)
        section_path.mkdir(parents=True, exist_ok=True)
        filepath = section_path / filename
        if filename.endswith(".md"):
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(data if isinstance(data, str) else str(data))
        else:
            self._save_json(filepath, data)

    def log_command(self, command: str, response_summary: str = "", context: Optional[dict] = None):
        """Log every command/query to active memory and session."""
        now = datetime.now(timezone.utc).isoformat()
        entry = {
            "timestamp": now,
            "session_id": self.session_id,
            "command": command,
            "response_summary": response_summary,
            "context": context or {}
        }

        filename = f"cmd_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')}.json"
        self._save_to_section("active", filename, entry)

        session_data = self._load_json(
            self._get_section_path("sessions") / f"{self.session_id}.json",
            {}
        )
        if "commands" not in session_data:
            session_data["commands"] = []
        session_data["commands"].append({
            "timestamp": now,
            "command": command[:200],
            "response_summary": response_summary[:200]
        })
        session_data["last_activity"] = now
        session_data["commands_count"] = len(session_data["commands"])
        self._save_to_section("sessions", f"{self.session_id}.json", session_data)

        self._update_index("active", 1)
        logger.info(f"Command logged: {command[:60]}...")

    def save_context(self, key: str, data, section: str = "active"):
        """Save any context data to memory."""
        now = datetime.now(timezone.utc).isoformat()
        entry = {
            "timestamp": now,
            "session_id": self.session_id,
            "key": key,
            "data": data
        }
        filename = f"ctx_{key}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        self._save_to_section(section, filename, entry)
        self._update_index(section, 1)
        logger.info(f"Context saved: {key} -> {section}")

    def save_rule(self, title: str, content: str):
        """Save or update a project rule."""
        now = datetime.now(timezone.utc).isoformat()
        filename = f"rule_{title.lower().replace(' ', '_')[:30]}.md"
        md_content = f"# {title}\n\n{content}\n\n---\n*Created: {now}*\n"
        self._save_to_section("rules", filename, md_content)
        self._update_index("rules", 1)
        logger.info(f"Rule saved: {title}")

    def save_doc(self, title: str, content: str):
        """Save project documentation."""
        now = datetime.now(timezone.utc).isoformat()
        filename = f"doc_{title.lower().replace(' ', '_')[:30]}.md"
        md_content = f"# {title}\n\n{content}\n\n---\n*Last updated: {now}*\n"
        self._save_to_section("docs", filename, md_content)
        self._update_index("docs", 1)
        logger.info(f"Doc saved: {title}")

    def get_recent_context(self, section: str = "active", limit: int = 10) -> list:
        """Retrieve most recent memory entries from a section."""
        section_path = self._get_section_path(section)
        if not section_path.exists():
            return []

        files = sorted(section_path.glob("*.json"), key=os.path.getmtime, reverse=True)[:limit]
        entries = []
        for f in files:
            data = self._load_json(f, {})
            data["_file"] = f.name
            entries.append(data)
        return entries

    def get_session_summary(self) -> dict:
        """Get current session summary."""
        session_path = self._get_section_path("sessions") / f"{self.session_id}.json"
        return self._load_json(session_path, {"session_id": self.session_id, "commands_count": 0})

    def archive_active(self, older_than_hours: int = 24):
        """Move old active entries to archive."""
        active_path = self._get_section_path("active")
        archive_path = self._get_section_path("archive")
        now = time.time()
        cutoff = now - (older_than_hours * 3600)

        if not active_path.exists():
            return

        count = 0
        for f in active_path.glob("*.json"):
            if f.stat().st_mtime < cutoff:
                shutil.move(str(f), str(archive_path / f.name))
                count += 1

        if count > 0:
            self._update_index("active", -count)
            self._update_index("archive", count)
            logger.info(f"Archived {count} files from active")

    def get_memory_report(self) -> dict:
        """Generate full memory system report."""
        sections = {}
        for section_name, section_config in self.config.get("sections", {}).items():
            section_path = self._get_section_path(section_name)
            if section_path.exists():
                files = list(section_path.glob("*"))
                sections[section_name] = {
                    "file_count": len(files),
                    "path": str(section_path),
                    "retention_days": section_config.get("retention_days", 30)
                }

        return {
            "project": self.config.get("project", "Unknown"),
            "version": self.config.get("version", "1.0.0"),
            "session_id": self.session_id,
            "total_sections": len(sections),
            "sections": sections,
            "last_updated": self.index.get("last_updated", ""),
            "total_commands": self.index.get("total_commands", 0)
        }

    def auto_backup(self):
        """Create a backup of all memory data."""
        backup_dir = MEMORY_DIR / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"memory_backup_{timestamp}.zip"
        shutil.make_archive(str(backup_path.with_suffix("")), "zip", MEMORY_DIR)
        logger.info(f"Backup created: {backup_path.name}")
        return str(backup_path)


manager = MemoryManager()
