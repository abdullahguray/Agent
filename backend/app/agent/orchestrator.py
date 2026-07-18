from app.agent.planner import generate_scrape_plan
from app.agent.tools import scrape_url
from app.database.supabase import get_supabase
from app.database.models import ScrapedData, TaskLog
from app.config import settings

async def run_scrape_cycle(config: dict) -> dict:
    supabase = get_supabase()
    config_id = config["id"]
    topic = config["topic"]
    sources = config.get("sources", [])
    model_id = config.get("model", settings.nvidia_model)

    task_log = TaskLog(
        config_id=config_id,
        cycle_number=config.get("_current_cycle", 1),
        status="scraping",
        started_at=None
    )

    log_result = supabase.table("task_logs").insert(task_log.model_dump(exclude_none=True)).execute()
    log_id = log_result.data[0]["id"] if log_result.data else None

    plan = generate_scrape_plan(topic, sources, model_id=model_id)
    items_scraped = 0
    errors = []

    target_sites = plan.get("target_sites", [])
    max_items = min(plan.get("max_items", 5), settings.max_scrape_items)
    limit = min(max_items, len(target_sites))

    for i, site in enumerate(target_sites[:limit]):
        try:
            result = await scrape_url(site["url"], site.get("selectors"))
            if result.get("error"):
                errors.append(result["error"])
                continue

            scraped = ScrapedData(
                config_id=config_id,
                title=result.get("title", ""),
                content=result.get("content", ""),
                source_url=result.get("url", ""),
                raw_json=result,
                ai_summary=result.get("ai_summary", "")
            )
            supabase.table("scraped_data").insert(scraped.model_dump(exclude_none=True)).execute()
            items_scraped += 1

        except Exception as e:
            errors.append(str(e))

    status = "error" if errors and items_scraped == 0 else "completed"
    if log_id:
        supabase.table("task_logs").update({
            "status": status,
            "ended_at": "now()",
            "items_scraped": items_scraped,
            "error": "; ".join(errors[:3]) if errors else None,
            "tokens_used": 0
        }).eq("id", log_id).execute()

    return {
        "config_id": config_id,
        "topic": topic,
        "model_used": model_id,
        "items_scraped": items_scraped,
        "errors": errors,
        "status": status
    }
