"""Supabase auth integration for the backend."""
from fastapi import APIRouter, HTTPException, Header
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/verify")
async def verify_token(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    from supabase import create_client
    sb = create_client(settings.supabase_url, settings.supabase_anon_key)
    try:
        user = sb.auth.get_user(token)
        return {"user": user.user.id if user.user else None}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
