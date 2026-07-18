from fastapi import APIRouter, HTTPException, Depends
from app.database.supabase import get_supabase
from app.database.models import ConfigurationCreate
from app.agent.planner import generate_scrape_plan
from app.agent.models import MODEL_REGISTRY, get_models_by_category

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/health")
async def health():
    return {"status": "ok", "service": "scrape-agent-backend"}

@router.get("/models")
async def list_models(category: str = None):
    models = get_models_by_category(category)
    return {"data": models, "total": len(models)}

@router.get("/configurations")
async def list_configurations():
    supabase = get_supabase()
    result = supabase.table("configurations").select("*").execute()
    return {"data": result.data or []}

@router.post("/configurations")
async def create_configuration(config: ConfigurationCreate):
    supabase = get_supabase()
    result = supabase.table("configurations").insert(config.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create configuration")
    return {"data": result.data[0]}

@router.get("/configurations/{config_id}")
async def get_configuration(config_id: str):
    supabase = get_supabase()
    result = supabase.table("configurations").select("*").eq("id", config_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return {"data": result.data[0]}

@router.patch("/configurations/{config_id}")
async def update_configuration(config_id: str, config: dict):
    supabase = get_supabase()
    result = supabase.table("configurations").update(config).eq("id", config_id).execute()
    return {"data": result.data[0] if result.data else None}

@router.delete("/configurations/{config_id}")
async def delete_configuration(config_id: str):
    supabase = get_supabase()
    supabase.table("configurations").delete().eq("id", config_id).execute()
    return {"message": "Deleted"}

@router.get("/scraped-data")
async def get_scraped_data(config_id: str = None, limit: int = 50):
    supabase = get_supabase()
    query = supabase.table("scraped_data").select("*").order("scraped_at", desc=True).limit(limit)
    if config_id:
        query = query.eq("config_id", config_id)
    result = query.execute()
    return {"data": result.data or []}

@router.get("/task-logs")
async def get_task_logs(config_id: str = None, limit: int = 20):
    supabase = get_supabase()
    query = supabase.table("task_logs").select("*").order("started_at", desc=True).limit(limit)
    if config_id:
        query = query.eq("config_id", config_id)
    result = query.execute()
    return {"data": result.data or []}

@router.post("/plan")
async def plan_scrape(topic: str, sources: list[str] = None, model: str = None):
    try:
        plan = generate_scrape_plan(topic, sources or [], model_id=model)
        return {"data": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
