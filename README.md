# SlotWatch — Get an earlier Tesla service appointment

> SlotWatch watches Tesla service centers for **earlier appointment openings** and **emails you the moment one appears**, so you can reschedule in the Tesla app before it's gone.

Tesla service is often booked weeks out, but earlier slots open up all day as other owners cancel and reschedule — you just have to catch them. SlotWatch does the watching for you.

**Live app:** [slotwatcher.app](https://slotwatcher.app)

## What it does

- **Monitors Tesla service centers** (up to 3) for earlier appointment availability.
- **Emails you** the instant an earlier slot opens in your chosen date range. Email alerts only — no SMS on the hosted app.
- **Alert only.** SlotWatch never books or reschedules for you; you grab the slot yourself in the official Tesla app.
- **No Tesla login required** on the hosted app — we never ask for or store your Tesla credentials.

## Hosted vs. self-host

| | Hosted ([slotwatcher.app](https://slotwatcher.app)) | Self-host (this repo) |
|---|---|---|
| Price | **$24 one-time** for a 60-day watch (up to 3 centers), money-back guarantee; optional $6.99/mo to continue | Free, open source |
| Tesla login | Not required | You run it against your own Tesla account token |
| Alerts | Email | Email (SMS optional via Twilio) |
| Setup | None — sign up on the site | Docker, ~5 min |

## Self-hosting (free)

```bash
git clone https://github.com/manymotes/slotwatch
cd slotwatch
cp .env.example .env
# Edit .env with your details (see Configuration)
docker compose up -d
```

### Configuration

| Variable | Description |
|---|---|
| `TESLA_VIN` | Your Tesla VIN |
| `EMAIL_TO` | Where to send alerts |
| `EMAIL_SMTP_USER` / `EMAIL_SMTP_PASS` | SMTP (e.g. a Gmail app password) |
| `TWILIO_SID` / `TWILIO_TOKEN` / `TWILIO_FROM` / `SMS_TO` | Optional — for SMS alerts |
| `POLL_MIN` | Poll interval in minutes (default: 15) |

## How it works

1. Polls Tesla's service scheduling availability for your chosen service centers every ~15 minutes.
2. Compares against previously seen slots — only alerts on genuinely **new** earlier availability (no spam on the slots that already existed when you started).
3. Emails you when a sooner slot appears in your configured date window.
4. You open the Tesla app → Service → your appointment → Reschedule, and grab it.

## FAQ

**Does SlotWatch book the appointment for me?** No. It only alerts you to earlier openings; you reschedule yourself in the Tesla app.

**Do I need to give it my Tesla login?** Not on the hosted app — it never asks for your Tesla credentials. The self-host version runs against your own account token, on your own machine.

**How fast are alerts?** It checks roughly every 15 minutes and emails you when a new earlier slot appears.

**Is it affiliated with Tesla?** No. SlotWatch is an independent project and is not affiliated with, endorsed by, or connected to Tesla, Inc. "Tesla" is a trademark of Tesla, Inc.

## Keywords

Tesla service appointment, earlier Tesla service appointment, Tesla service cancellation alert, Tesla appointment watcher, Tesla service wait time, reschedule Tesla service, monitor Tesla service availability.

## Legal

This project uses Tesla's unofficial Owner Experience API. It is not affiliated with, endorsed by, or supported by Tesla, Inc. Use is subject to Tesla's Terms of Service. This software is for personal use and comes with no warranty of availability or fitness for any purpose.

## License

AGPL-3.0 — see LICENSE.

---

Questions: hello@slotwatcher.app
