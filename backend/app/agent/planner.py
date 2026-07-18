import json
from openai import OpenAI
from app.config import settings
from app.agent.models import get_model_params, get_model

nvidia_client = OpenAI(
    base_url=settings.nvidia_base_url,
    api_key=settings.nvidia_api_key
)

PLANNER_PROMPT = """You are a web scraping planning AI. Given a topic and optional sources, design a scraping plan.

Rules:
1. Identify what information to scrape
2. Generate search queries or URLs if none provided
3. Define CSS selectors or data extraction patterns
4. Return only valid JSON with this structure:

{
  "topic_analysis": "Brief summary",
  "target_sites": [
    {
      "url": "full URL",
      "purpose": "what data from this site",
      "selectors": {
        "title": "CSS selector or pattern",
        "content": "CSS selector or pattern"
      }
    }
  ],
  "extraction_fields": ["field1", "field2"],
  "max_items": 5
}"""

def generate_scrape_plan(topic: str, sources: list[str] = None, model_id: str = None) -> dict:
    if not model_id:
        model_id = settings.nvidia_model
    user_msg = f"Topic: {topic}\n"
    if sources:
        user_msg += f"Sources: {json.dumps(sources)}\n"

    params = get_model_params(model_id)
    params["messages"] = [
        {"role": "system", "content": PLANNER_PROMPT},
        {"role": "user", "content": user_msg}
    ]
    params["temperature"] = 0.3
    params["max_tokens"] = 1000

    response = nvidia_client.chat.completions.create(**params)
    model_used = get_model(model_id)

    try:
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        result = json.loads(content.strip())
        result["_model_used"] = model_id
        result["_model_name"] = model_used.get("name", model_id)
        return result
    except (json.JSONDecodeError, KeyError, AttributeError) as e:
        return {
            "topic_analysis": topic,
            "target_sites": [{"url": s, "purpose": topic, "selectors": {}} for s in (sources or [])],
            "extraction_fields": ["title", "content"],
            "max_items": 5,
            "error": str(e),
            "_model_used": model_id,
            "_model_name": model_used.get("name", model_id)
        }

def summarize_content(title: str, content: str, model_id: str = None) -> str:
    if not model_id:
        model_id = settings.nvidia_model
    params = get_model_params(model_id)
    params["messages"] = [
        {"role": "system", "content": "Summarize the following scraped content in 2-3 sentences. Focus on key facts and data points."},
        {"role": "user", "content": f"Title: {title}\n\nContent: {content[:2000]}"}
    ]
    params["temperature"] = 0.2
    params["max_tokens"] = 300
    response = nvidia_client.chat.completions.create(**params)
    return response.choices[0].message.content.strip()
