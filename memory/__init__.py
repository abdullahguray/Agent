"""
Persistent Memory System
=======================
Version: 1.0.0
Auto-saves context every 6 seconds.
Manages memory sections: active, archive, rules, docs, sessions.
"""

from .memory_manager import MemoryManager, manager
