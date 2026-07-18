# Project Rules & Conventions

## Architecture Rules
- Backend: FastAPI + Python 3.11+
- Dashboard: Next.js 14 + TypeScript + Tailwind CSS
- Database: Supabase PostgreSQL
- AI Model: NVIDIA API (OpenAI-compatible)
- Deployment: Netlify (dashboard), VPS/Docker (backend)

## Code Conventions
- Python: PEP 8, type hints required
- TypeScript: Strict mode, interfaces over types
- All API responses: {"data": ..., "error": ...} format
- No hardcoded secrets (use env vars or config.py)

## Memory System Rules
- Every command is logged to memory/sections/sessions/
- Active decisions go to memory/sections/active/
- Rules updates go to memory/sections/rules/
- Archive data older than 7 days automatically
- Backup memory every 24 hours

## Schedule Rules
- Work: 3 minutes scraping
- Sleep: 3 minutes idle
- Cycle repeats indefinitely (24/7)
