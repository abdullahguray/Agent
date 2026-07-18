# Cloudflare Tunnel Setup

## 1. Install cloudflared

```bash
# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -o cloudflared.exe
```

## 2. Authenticate

```bash
cloudflared tunnel login
# Opens browser - select your domain
```

## 3. Create a Tunnel

```bash
cloudflared tunnel create scrape-agent
# Creates a credentials file: ~/.cloudflared/<tunnel-id>.json
```

## 4. Create config file

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\DELL\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: scrape.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

## 5. Route DNS

```bash
cloudflared tunnel route dns scrape-agent scrape.yourdomain.com
```

## 6. Start Tunnel

```bash
cloudflared tunnel run scrape-agent
```

## 7. Run as Windows Service (24/7)

```bash
cloudflared service install
```

Now your backend is accessible at `https://scrape.yourdomain.com` with DDoS protection.
