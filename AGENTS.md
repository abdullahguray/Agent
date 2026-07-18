# Scrape Agent AI - Engineer Instructions

You are building an AI-powered web scraping agent.

## Project Structure
- `backend/` - FastAPI Python server
- `dashboard/` - Next.js 14 + TypeScript + Tailwind
- `memory/` - Persistent memory system (auto-save 6s)
- `database/` - Supabase PostgreSQL

## Memory System (CRITICAL)
You have a persistent memory system at `memory/`. It auto-saves every 6 seconds.

### Every Session Start:
1. Run: `python scrape-agent/memory/opencode_memory.py --load`
2. This loads: previous commands, active context, rules, docs, session summary

### Logging Actions:
- `python memory/opencode_memory.py --command '{"cmd": "...", "response": "..."}'`
- Or use `python memory/opencode_memory.py --save`

### Memory Sections:
- `active/` - Current session (auto-archive 24h)
- `archive/` - Historical (90 days)
- `rules/` - Project rules (permanent)
- `docs/` - Documentation (permanent)
- `sessions/` - Session logs (30 days)

## Tech Stack
- Backend: FastAPI, Playwright, NVIDIA AI (Llama 3.1 70B)
- Dashboard: Next.js 14, Netlify
- Database: Supabase PostgreSQL
- Scheduler: 3min work / 3min sleep cycle

## Rules
- Always load memory at session start
- Log major actions to memory
- Use Supabase service role key for backend ops
- NVIDIA API key is in config.py
