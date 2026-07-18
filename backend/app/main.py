import uvicorn
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.auth import router as auth_router
from app.scheduler.worker import run_worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

worker_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_task
    logger.info("Starting background worker...")
    worker_task = asyncio.create_task(run_worker())
    yield
    logger.info("Shutting down...")
    if worker_task:
        worker_task.cancel()
        try:
            await worker_task
        except asyncio.CancelledError:
            pass

app = FastAPI(
    title="Scrape Agent Backend",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(auth_router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
