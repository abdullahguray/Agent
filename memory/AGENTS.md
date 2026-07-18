# Memory System - AI Engineer Guide

THIS IS YOUR PERSONAL MEMORY SYSTEM. Use it every session.

## Every Session Start (AUTO)
The memory server auto-starts via opencode.json.
It loads: previous commands, active context, rules, docs.

## Commands You Can Run

### Load context (do this first!)
```bash
python memory/opencode_memory.py --load
```
Returns: recent commands, active rules, docs, session summary

### Save progress
```bash
python memory/opencode_memory.py --save
```

### Log a command you ran
```bash
python memory/opencode_memory.py --command '{"cmd": "created scraper engine", "response": "engine.py built"}'
```

### Get memory report
```bash
python memory/opencode_memory.py --report
```

### Save a rule for future sessions
```python
from memory.memory_manager import manager
manager.save_rule("Rule Name", "Rule content here")
```

### Save documentation
```python
from memory.memory_manager import manager
manager.save_doc("Doc Title", "Documentation content")
```

## Memory Sections
- **active/** - Current session commands and context (auto-archived after 24h)
- **archive/** - Historical data (90 day retention)
- **rules/** - Project rules and conventions (never deleted)
- **docs/** - Documentation (never deleted)
- **sessions/** - Session logs (30 day retention)

## Rules
1. Run `--load` at session start to get context
2. Log every major action with `--command`
3. Save rules when you discover them
4. Save docs when you create something significant
5. Memory auto-saves every 6 seconds (no need to manually save)
6. Always reference memory before answering user questions
