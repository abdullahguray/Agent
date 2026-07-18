from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ConfigurationCreate(BaseModel):
    topic: str
    sources: list[str] = []
    model: str = "meta/llama-3.3-70b-instruct"
    schedule: dict = {"work_min": 3, "sleep_min": 3}
    status: str = "active"

class Configuration(BaseModel):
    id: str
    user_id: str
    topic: str
    sources: list
    model: str = "meta/llama-3.3-70b-instruct"
    schedule: dict
    status: str
    created_at: str
    updated_at: str

class ScrapedData(BaseModel):
    id: Optional[str] = None
    config_id: str
    title: Optional[str] = None
    content: Optional[str] = None
    source_url: Optional[str] = None
    raw_json: Optional[Any] = None
    ai_summary: Optional[str] = None
    scraped_at: Optional[str] = None

class TaskLog(BaseModel):
    id: Optional[str] = None
    config_id: str
    cycle_number: int = 1
    status: str = "running"
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    error: Optional[str] = None
    items_scraped: int = 0
    tokens_used: int = 0

class ScrapeResult(BaseModel):
    title: str
    content: str
    source_url: str
    raw_data: dict
