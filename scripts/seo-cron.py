#!/usr/bin/env python3
"""
SlotWatch SEO 10-Day Cron
Runs via GitHub Actions every ~10 days.

Steps:
1. Check GSC indexing + performance
2. Promote next batch of cities (advance releaseDate to today)
3. Build + deploy to Cloudflare Pages
4. Request Google indexing for new pages
5. Email report to motesmass@gmail.com

Required env vars:
  RESEND_API_KEY   - for email
  CF_API_TOKEN     - wrangler auth (set as CLOUDFLARE_API_TOKEN)
  GSC_KEY_JSON     - service account JSON (base64 encoded)
"""

import os, sys, json, time, subprocess, base64, datetime, re
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
REPO_ROOT   = Path(__file__).parent.parent
WEB_DIR     = REPO_ROOT / 'apps' / 'web'
OUT_DIR     = WEB_DIR / 'out'
LIB_FILE    = WEB_DIR / 'lib' / 'service-centers.ts'
SITE        = 'sc-domain:slotwatcher.app'
BASE_URL    = 'https://slotwatcher.app'
ADMIN_EMAIL = 'motesmass@gmail.com'
CITIES_PER_RUN = 5  # How many new cities to promote each run

# ── Google credentials (from env, written to temp file) ────────────────────────
def setup_gsc_credentials():
    key_json = os.environ.get('GSC_KEY_JSON', '')
    if not key_json:
        # Fall back to file if running locally
        local_key = Path('/Users/kendallmotes/seo/seo-metrics/service-account-key.json')
        if local_key.exists():
            return str(local_key)
        print("ERROR: GSC_KEY_JSON env var not set")
        sys.exit(1)
    # Decode base64 and write to temp file
    key_data = base64.b64decode(key_json).decode()
    tmp = Path('/tmp/gsc-key.json')
    tmp.write_text(key_data)
    return str(tmp)

def get_gsc_service(key_file, readonly=True):
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    scope = 'https://www.googleapis.com/auth/webmasters.readonly' if readonly else \
            'https://www.googleapis.com/auth/webmasters'
    creds = service_account.Credentials.from_service_account_file(key_file, scopes=[scope])
    return build('searchconsole', 'v1', credentials=creds)

# ── City promotion ────────────────────────────────────────────────────────────
def get_next_cities_to_promote(n=CITIES_PER_RUN):
    """Find cities whose releaseDate is in the future, take the soonest n."""
    today = datetime.date.today().strftime('%Y-%m-%d')
    content = LIB_FILE.read_text()
    # Find all releaseDate entries that are in the future
    pattern = r"releaseDate: '(\d{4}-\d{2}-\d{2})'"
    dates = re.findall(pattern, content)
    future = sorted(set(d for d in dates if d > today))
    if not future:
        return []
    # Take the earliest future date's cities (up to n)
    earliest = future[0]
    return earliest, n

def promote_cities(n=CITIES_PER_RUN):
    """Advance n cities' releaseDates to today so they get built."""
    today = datetime.date.today().strftime('%Y-%m-%d')
    content = LIB_FILE.read_text()
    # Find the earliest future date
    pattern = r"releaseDate: '(\d{4}-\d{2}-\d{2})'"
    all_dates = re.findall(pattern, content)
    future_dates = sorted(set(d for d in all_dates if d > today))
    if not future_dates:
        print("No future cities to promote")
        return 0, []

    earliest = future_dates[0]
    # Replace first n occurrences of earliest with today
    promoted = 0
    promoted_slugs = []

    # Find slugs near the date for reporting
    lines = content.split('\n')
    in_block = False
    current_slug = None
    new_lines = []

    for i, line in enumerate(lines):
        if "slug:" in line:
            m = re.search(r"slug: '([^']+)'", line)
            if m:
                current_slug = m.group(1)
        if f"releaseDate: '{earliest}'" in line and promoted < n:
            line = line.replace(f"releaseDate: '{earliest}'", f"releaseDate: '{today}'")
            promoted += 1
            if current_slug:
                promoted_slugs.append(current_slug)
        new_lines.append(line)

    LIB_FILE.write_text('\n'.join(new_lines))
    print(f"Promoted {promoted} cities from {earliest} to {today}: {promoted_slugs}")
    return promoted, promoted_slugs

# ── Build + Deploy ────────────────────────────────────────────────────────────
def build_and_deploy():
    print("\n=== Building Next.js ===")
    r = subprocess.run(['npm', 'run', 'build'], cwd=WEB_DIR, capture_output=True, text=True)
    if r.returncode != 0:
        print("BUILD FAILED:")
        print(r.stderr[-2000:])
        return False
    print("✓ Build complete")

    print("\n=== Deploying to Cloudflare Pages ===")
    r = subprocess.run([
        'npx', 'wrangler', 'pages', 'deploy', './out',
        '--project-name=slotwatch-web', '--branch=main', '--commit-dirty=true'
    ], cwd=WEB_DIR, capture_output=True, text=True,
    env={**os.environ, 'CLOUDFLARE_API_TOKEN': os.environ.get('CF_API_TOKEN', os.environ.get('CLOUDFLARE_API_TOKEN', ''))})

    if r.returncode != 0:
        print("DEPLOY FAILED:")
        print(r.stderr[-2000:])
        return False
    print("✓ Deployed")
    # Extract URL
    for line in r.stdout.split('\n'):
        if 'pages.dev' in line:
            print(f"  URL: {line.strip()}")
    return True

# ── GSC Indexing ──────────────────────────────────────────────────────────────
def get_live_pages():
    pages = [f'{BASE_URL}/']
    if not OUT_DIR.exists():
        return pages
    for d in sorted(os.listdir(OUT_DIR)):
        path = OUT_DIR / d
        if path.is_dir() and not d.startswith('_') and d not in ('404',):
            pages.append(f'{BASE_URL}/{d}/')
    return pages

def check_and_request_indexing(svc, pages, delay=1.0):
    results = {'indexed': [], 'pending': [], 'errors': []}
    print(f"\n=== Checking indexing for {len(pages)} pages ===")
    for url in pages:
        try:
            r = svc.urlInspection().index().inspect(
                body={'inspectionUrl': url, 'siteUrl': SITE}
            ).execute()
            status = r.get('inspectionResult', {}).get('indexStatusResult', {})
            coverage = status.get('coverageState', 'unknown')
            if 'indexed' in coverage.lower():
                results['indexed'].append(url)
                print(f"  ✓ {url.replace(BASE_URL, '') or '/'}")
            else:
                results['pending'].append({'url': url, 'state': coverage})
                print(f"  ⏳ {url.replace(BASE_URL, '') or '/'} ({coverage})")
            time.sleep(delay)
        except Exception as e:
            results['errors'].append({'url': url, 'error': str(e)[:80]})
            time.sleep(delay)
    return results

def get_performance(svc, days=28):
    end = datetime.date.today().strftime('%Y-%m-%d')
    start = (datetime.date.today() - datetime.timedelta(days=days)).strftime('%Y-%m-%d')
    try:
        p = svc.searchanalytics().query(siteUrl=SITE, body={
            'startDate': start, 'endDate': end,
            'dimensions': ['page'], 'rowLimit': 20
        }).execute()
        q = svc.searchanalytics().query(siteUrl=SITE, body={
            'startDate': start, 'endDate': end,
            'dimensions': ['query'], 'rowLimit': 10
        }).execute()
        return {
            'pages': p.get('rows', []),
            'queries': q.get('rows', []),
            'clicks': sum(r['clicks'] for r in p.get('rows', [])),
            'impressions': sum(r['impressions'] for r in p.get('rows', [])),
        }
    except Exception as e:
        return {'error': str(e), 'pages': [], 'queries': [], 'clicks': 0, 'impressions': 0}

def get_sitemap_status(svc):
    try:
        sm = svc.sitemaps().list(siteUrl=SITE).execute()
        for s in sm.get('sitemap', []):
            if 'sitemap.xml' in s['path']:
                c = s.get('contents', [{}])
                return {
                    'submitted': c[0].get('submitted', 0) if c else 0,
                    'indexed': c[0].get('indexed', 0) if c else 0,
                    'lastFetched': s.get('lastDownloaded', '')[:10],
                }
    except:
        pass
    return {'submitted': 0, 'indexed': 0, 'lastFetched': '?'}

# ── Email report ──────────────────────────────────────────────────────────────
def send_report(subject, text_body, html_body=None):
    api_key = os.environ.get('RESEND_API_KEY', '')
    if not api_key:
        print("No RESEND_API_KEY — printing report")
        print(text_body)
        return
    import urllib.request
    payload = json.dumps({
        'from': 'SlotWatch SEO <onboarding@resend.dev>',
        'to': [ADMIN_EMAIL],
        'subject': subject,
        'text': text_body,
        'html': html_body or f'<pre>{text_body}</pre>',
    }).encode()
    req = urllib.request.Request('https://api.resend.com/emails', data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req)
        print(f"✓ Report emailed to {ADMIN_EMAIL}")
    except Exception as e:
        print(f"Email error: {e}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    date_str = datetime.date.today().strftime('%B %d, %Y')
    print(f"\n{'='*50}")
    print(f"SlotWatch SEO Cron — {date_str}")
    print('='*50)

    key_file = setup_gsc_credentials()
    svc_ro = get_gsc_service(key_file, readonly=True)
    svc_rw = get_gsc_service(key_file, readonly=False)

    # 1. Resubmit sitemap
    try:
        svc_rw.sitemaps().submit(siteUrl=SITE, feedpath=f'{BASE_URL}/sitemap.xml').execute()
        print("✓ Sitemap resubmitted")
    except Exception as e:
        print(f"Sitemap error: {e}")

    # 2. Get current stats
    perf = get_performance(svc_ro)
    sitemap = get_sitemap_status(svc_ro)
    print(f"\nCurrent: {perf['clicks']} clicks, {perf['impressions']} impressions")
    print(f"Sitemap: {sitemap['submitted']} submitted, {sitemap['indexed']} indexed")

    # 3. Promote next batch of cities
    promoted_count, promoted_slugs = promote_cities(CITIES_PER_RUN)

    # 4. Build + deploy if there are new cities or always (to keep fresh)
    deployed = False
    if promoted_count > 0:
        deployed = build_and_deploy()
    else:
        print("\nNo new cities to promote this cycle")

    # 5. Request indexing for all live pages
    time.sleep(10)  # Brief pause after deploy
    live_pages = get_live_pages()
    idx = check_and_request_indexing(svc_ro, live_pages)

    # 6. Build report
    lines = [
        f"SlotWatch SEO Report — {date_str}",
        f"",
        f"PERFORMANCE (last 28 days)",
        f"  Clicks: {perf['clicks']}",
        f"  Impressions: {perf['impressions']}",
        f"",
        f"INDEXING",
        f"  Sitemap: {sitemap['submitted']} submitted / {sitemap['indexed']} indexed",
        f"  Pages indexed: {len(idx['indexed'])} / {len(live_pages)}",
        f"  Pages pending: {len(idx['pending'])}",
        f"",
        f"TOP PAGES",
    ]
    for r in perf['pages'][:8]:
        pg = r['keys'][0].replace(BASE_URL, '') or '/'
        lines.append(f"  {pg}: {r['clicks']} clicks, {r['impressions']} impr, pos {r['position']:.0f}")

    if promoted_slugs:
        lines += ['', f"NEW CITIES ADDED ({promoted_count})", *[f"  • {s}" for s in promoted_slugs]]

    if idx['errors']:
        lines += ['', f"ERRORS ({len(idx['errors'])})"]
        for e in idx['errors'][:5]:
            lines.append(f"  {e['url']}: {e['error']}")

    report = '\n'.join(lines)
    print(f"\n{report}")

    subject = f"SlotWatch SEO — {len(idx['indexed'])}/{len(live_pages)} indexed, {perf['impressions']} impr — {date_str}"
    send_report(subject, report)
    print("\n✓ Cron complete")

if __name__ == '__main__':
    main()
