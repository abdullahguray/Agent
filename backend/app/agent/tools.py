"""Tools available to the AI agent for scraping operations."""

from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from app.agent.planner import summarize_content

async def scrape_url(url: str, selectors: dict = None) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        result = {"url": url, "title": "", "content": "", "raw_html": ""}

        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            result["title"] = await page.title()

            if selectors and "content" in selectors:
                try:
                    el = await page.query_selector(selectors["content"])
                    if el:
                        result["content"] = await el.inner_text()
                except:
                    pass

            if not result["content"]:
                body = await page.query_selector("body")
                if body:
                    text = await body.inner_text()
                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    result["content"] = "\n".join(lines[:100])

            result["raw_html"] = await page.content()

            if result["content"]:
                result["ai_summary"] = summarize_content(result["title"], result["content"])

        except Exception as e:
            result["error"] = str(e)
        finally:
            await browser.close()

        return result
