# SlotWatch

> Get alerted the moment an earlier Tesla service appointment opens up.

SlotWatch watches for cancellations at Tesla service centers and sends you an instant SMS or email when a slot opens in your target date window.

**No booking, no rescheduling — alert only.** You open the Tesla app and grab the slot yourself.

## Self-hosting (free)

```bash
git clone https://github.com/manymotes/slotwatch
cd slotwatch
cp .env.example .env
# Edit .env with your details (see Configuration)
docker compose up -d
open http://localhost:3001
```

## Managed hosting ($9.99/mo)

Don't want to run your own server? [slotwatcher.app](https://slotwatcher.app) runs it for you.

## Configuration

| Variable | Description |
|---|---|
| TESLA_VIN | Your Tesla VIN |
| EMAIL_TO | Where to send alerts |
| EMAIL_SMTP_USER / EMAIL_SMTP_PASS | Gmail app password |
| TWILIO_SID / TWILIO_TOKEN / TWILIO_FROM / SMS_TO | For SMS alerts |
| POLL_MIN | Poll interval in minutes (default: 30) |

## How it works

1. Connects to Tesla's service scheduling API using your account's OAuth token
2. Polls for available slots at your chosen service centers every 30 minutes
3. Compares against previously seen slots — only alerts on genuinely new availability
4. Sends email and/or SMS when new slots appear in your configured date window

## Legal

This project uses Tesla's unofficial Owner Experience API. It is not affiliated with, endorsed by, or supported by Tesla, Inc. Use is subject to Tesla's Terms of Service.

This software is for personal use. The developer makes no warranty of availability or fitness for any purpose.

## License

AGPL-3.0 — See LICENSE

## Operations

### Health monitoring
The health monitor runs every 4 hours on the Mac Mini and emails motesmass@gmail.com if anything is broken.

```bash
# Run manually
npx ts-node scripts/health-check.ts

# Force a status report email even if everything is OK
FORCE_REPORT=true npx ts-node scripts/health-check.ts

# Validate after deploy
./scripts/validate-deploy.sh https://slotwatcher.app
```

### pSEO publishing schedule
New service center pages are published every Monday via GitHub Actions.
Pages are prioritized by Tesla ownership density and search demand.

```bash
# Check how many pages are live today
node -e "const {SERVICE_CENTERS} = require('./apps/web/lib/service-centers'); const t = new Date().toISOString().split('T')[0]; console.log('Live:', SERVICE_CENTERS.filter(c=>c.releaseDate<=t).length, '/', SERVICE_CENTERS.length)"
```
