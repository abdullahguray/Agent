# Deployment Guide

## 1. Supabase

1. Go to https://supabase.com/dashboard/project/itzwwompgyjgxkaddxvl
2. Open SQL Editor
3. Paste and run `supabase_setup.sql`

## 2. Backend (VPS / Windows Server)

### Option A: Docker (Recommended)

```bash
cd backend
docker build -t scrape-agent-backend .
docker run -d --name scrape-agent -p 8000:8000 scrape-agent-backend
```

### Option B: Direct Python

```bash
cd backend
pip install -r requirements.txt
playwright install chromium
python -m app.main
```

### Environment Variables

The backend already has credentials hardcoded in `config.py`. For production, set:

```bash
export NVIDIA_API_KEY=nvapi-...
```

## 3. Dashboard (Netlify)

```bash
cd dashboard
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://itzwwompgyjgxkaddxvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://scrape.yourdomain.com
```

Build and deploy:

```bash
npm run build
npx netlify deploy --prod --dir out --auth nfp_ahgkKZm48m1ksR162tCVrWoGdeTpc2FS24e7
```

## 4. Cloudflare Tunnel

Follow `SETUP_CLOUDFLARE.md` to secure the backend.

## 5. Verify

- Dashboard: https://your-dashboard.netlify.app
- Backend: https://scrape.yourdomain.com/api/health
- Supabase: https://supabase.com/dashboard
