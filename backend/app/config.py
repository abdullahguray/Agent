import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = "https://itzwwompgyjgxkaddxvl.supabase.co"
    supabase_service_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM3NTU3NCwiZXhwIjoyMDk5OTUxNTc0fQ.N2dgZE22Z2t4aHrmzfOjVwwT5YJwawgtCd__twnuUlU"
    supabase_anon_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzU1NzQsImV4cCI6MjA5OTk1MTU3NH0.LSdpciqk_pRO3LipHC50uX7uOC58GfXC8QRK6FM9plM"

    nvidia_api_key: str = "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"
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "meta/llama-3.3-70b-instruct"

    work_minutes: int = 3
    sleep_minutes: int = 3
    max_scrape_items: int = 10

    class Config:
        env_file = ".env"

settings = Settings()
