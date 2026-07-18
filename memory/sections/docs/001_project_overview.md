# Scrape Agent AI - Project Overview

## What is This?
An AI-powered web scraping agent that:
1. User configures a topic via Dashboard
2. AI Agent (NVIDIA LLM) plans the scraping strategy
3. Playwright scrapes the target websites
4. Data is stored in Supabase
5. Runs 24/7 with 3min work / 3min sleep cycles

## Components
- **Backend**: FastAPI server (Python) - runs the AI agent + scraper + scheduler
- **Dashboard**: Next.js web UI (deployed on Netlify)
- **Database**: Supabase PostgreSQL
- **AI**: NVIDIA API (Llama 3.1 70B)
- **Scraping**: Playwright (headless browser)

## System Flow
User → Dashboard → API Config → Scheduler → AI Agent → Playwright → Supabase
