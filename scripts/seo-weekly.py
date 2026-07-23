#!/usr/bin/env python3
"""
SlotWatch Weekly SEO Cron
- Requests Google indexing for live pages
- Monitors coverage status
- Reports which pages are indexed vs pending
- Emails a summary to motesmass@gmail.com

Run weekly (Monday after GitHub Actions deploys new pages):
  python3 scripts/seo-weekly.py

Or set up via crontab:
  0 10 * * 1 cd /Users/kendallmotes/slotwatch && python3 scripts/seo-weekly.py
"""

import os, json, time, smtplib, datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

KEY_FILE = '/Users/kendallmotes/seo/seo-metrics/service-account-key.json'
SITE = 'sc-domain:slotwatcher.app'
BASE_URL = 'https://slotwatcher.app'
OUT_DIR = os.path.join(os.path.dirname(__file__), '../apps/web/out')

SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USER = 'golf@theopencourse.app'
SMTP_PASS = os.environ.get('SMTP_PASS', '')
EMAIL_TO = 'motesmass@gmail.com'


def get_gsc_service(readonly=True):
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    scope = 'https://www.googleapis.com/auth/webmasters.readonly' if readonly else \
            'https://www.googleapis.com/auth/webmasters'
    creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=[scope])
    return build('searchconsole', 'v1', credentials=creds)


def get_live_pages():
    """Pages currently built in the out/ directory."""
    pages = [f'{BASE_URL}/']
    if not os.path.exists(OUT_DIR):
        return pages
    for d in sorted(os.listdir(OUT_DIR)):
        path = os.path.join(OUT_DIR, d)
        if os.path.isdir(path) and not d.startswith('_') and d not in ('404',):
            pages.append(f'{BASE_URL}/{d}/')
    return pages


def request_indexing(svc, urls, delay=1.5):
    """Request Google indexing for a list of URLs via URL Inspection API."""
    results = {'indexed': [], 'submitted': [], 'errors': []}
    for url in urls:
        try:
            r = svc.urlInspection().index().inspect(
                body={'inspectionUrl': url, 'siteUrl': SITE}
            ).execute()
            status = r.get('inspectionResult', {}).get('indexStatusResult', {})
            coverage = status.get('coverageState', 'unknown')
            indexing = status.get('indexingState', 'unknown')

            if coverage in ('Submitted and indexed', 'Indexed, not submitted in sitemap'):
                results['indexed'].append({'url': url, 'state': coverage})
            else:
                results['submitted'].append({'url': url, 'state': coverage, 'indexing': indexing})

            time.sleep(delay)  # Respect API quota
        except Exception as e:
            results['errors'].append({'url': url, 'error': str(e)[:100]})
            time.sleep(delay)
    return results


def get_performance_summary(svc):
    """Get last 28 days of performance data."""
    end = datetime.date.today().strftime('%Y-%m-%d')
    start = (datetime.date.today() - datetime.timedelta(days=28)).strftime('%Y-%m-%d')
    try:
        p = svc.searchanalytics().query(siteUrl=SITE, body={
            'startDate': start, 'endDate': end,
            'dimensions': ['page'], 'rowLimit': 25
        }).execute()
        q = svc.searchanalytics().query(siteUrl=SITE, body={
            'startDate': start, 'endDate': end,
            'dimensions': ['query'], 'rowLimit': 10
        }).execute()
        return {
            'pages': p.get('rows', []),
            'queries': q.get('rows', []),
            'total_clicks': sum(r['clicks'] for r in p.get('rows', [])),
            'total_impressions': sum(r['impressions'] for r in p.get('rows', [])),
        }
    except Exception as e:
        return {'error': str(e)}


def get_sitemap_status(svc):
    """Check sitemap submitted vs indexed count."""
    try:
        sm = svc.sitemaps().list(siteUrl=SITE).execute()
        for s in sm.get('sitemap', []):
            if 'sitemap.xml' in s['path']:
                c = s.get('contents', [{}])
                return {
                    'submitted': c[0].get('submitted', 0) if c else 0,
                    'indexed': c[0].get('indexed', 0) if c else 0,
                    'lastFetched': s.get('lastDownloaded', 'never')[:10] if s.get('lastDownloaded') else 'never',
                }
    except Exception as e:
        return {'error': str(e)}
    return {}


def send_report(subject, html_body):
    """Email the SEO report."""
    if not SMTP_PASS:
        print("SMTP_PASS not set — skipping email, printing report:")
        print(html_body)
        return
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'SlotWatch SEO <{SMTP_USER}>'
    msg['To'] = EMAIL_TO
    msg.attach(MIMEText(html_body, 'html'))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_USER, EMAIL_TO, msg.as_string())
    print(f"✓ Report emailed to {EMAIL_TO}")


def build_html_report(date_str, live_pages, indexing_results, perf, sitemap):
    pages_indexed = len(indexing_results.get('indexed', []))
    pages_pending = len(indexing_results.get('submitted', []))
    pages_errors = len(indexing_results.get('errors', []))
    total_live = len(live_pages)

    top_pages = '\n'.join(
        f"<tr><td style='padding:4px 8px'>{r['keys'][0].replace(BASE_URL,'') or '/'}</td>"
        f"<td style='padding:4px 8px;text-align:center'>{r['clicks']}</td>"
        f"<td style='padding:4px 8px;text-align:center'>{r['impressions']}</td>"
        f"<td style='padding:4px 8px;text-align:center'>{r['position']:.0f}</td></tr>"
        for r in perf.get('pages', [])[:10]
    ) or '<tr><td colspan=4 style="padding:8px;color:#888">No data yet</td></tr>'

    indexed_list = '\n'.join(
        f"<li style='color:#15803d'>✓ {r['url'].replace(BASE_URL,'') or '/'}</li>"
        for r in indexing_results.get('indexed', [])
    )
    pending_list = '\n'.join(
        f"<li style='color:#92400e'>⏳ {r['url'].replace(BASE_URL,'') or '/'} ({r.get('state','')})</li>"
        for r in indexing_results.get('submitted', [])[:20]
    )

    return f"""
<div style="font-family:-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f9f9f9">
  <div style="background:#080808;padding:20px 24px;border-radius:10px 10px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">SlotWatch SEO Report — {date_str}</h2>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 10px 10px;border:1px solid #e5e5e5">

    <h3 style="margin:0 0 12px;color:#111">📊 Search Performance (Last 28 Days)</h3>
    <div style="display:flex;gap:16px;margin-bottom:20px">
      <div style="flex:1;background:#f5f5f5;border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:700;color:#e31937">{perf.get('total_clicks',0)}</div>
        <div style="color:#666;font-size:13px">Clicks</div>
      </div>
      <div style="flex:1;background:#f5f5f5;border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:700;color:#e31937">{perf.get('total_impressions',0)}</div>
        <div style="color:#666;font-size:13px">Impressions</div>
      </div>
      <div style="flex:1;background:#f5f5f5;border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:700;color:#e31937">{pages_indexed}</div>
        <div style="color:#666;font-size:13px">Pages Indexed</div>
      </div>
      <div style="flex:1;background:#f5f5f5;border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:28px;font-weight:700;color:#333">{total_live}</div>
        <div style="color:#666;font-size:13px">Live Pages</div>
      </div>
    </div>

    <h3 style="margin:0 0 8px;color:#111">🗺️ Sitemap Coverage</h3>
    <p style="margin:0 0 16px;color:#555;font-size:14px">
      Submitted: <strong>{sitemap.get('submitted',0)}</strong> |
      Indexed: <strong>{sitemap.get('indexed',0)}</strong> |
      Last fetched: {sitemap.get('lastFetched','?')}
    </p>

    <h3 style="margin:0 0 8px;color:#111">📄 Top Pages</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
      <tr style="background:#f5f5f5">
        <th style="padding:6px 8px;text-align:left">Page</th>
        <th style="padding:6px 8px">Clicks</th>
        <th style="padding:6px 8px">Impr.</th>
        <th style="padding:6px 8px">Pos.</th>
      </tr>
      {top_pages}
    </table>

    <h3 style="margin:0 0 8px;color:#111">✅ Indexed ({pages_indexed})</h3>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:13px">{indexed_list or '<li style="color:#888">None yet</li>'}</ul>

    <h3 style="margin:0 0 8px;color:#111">⏳ Pending / Crawled ({pages_pending})</h3>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:13px">{pending_list or '<li style="color:#888">None</li>'}</ul>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
    <p style="color:#aaa;font-size:12px;margin:0">
      slotwatcher.app SEO monitor · <a href="https://search.google.com/search-console?resource_id=sc-domain%3Aslotwatcher.app" style="color:#aaa">Open GSC</a>
    </p>
  </div>
</div>"""


def main():
    date_str = datetime.date.today().strftime('%B %d, %Y')
    print(f"\n=== SlotWatch SEO Cron — {date_str} ===\n")

    # Get live pages
    live_pages = get_live_pages()
    print(f"Live pages found: {len(live_pages)}")

    # Connect to GSC
    svc_ro = get_gsc_service(readonly=True)
    svc_rw = get_gsc_service(readonly=False)

    # Resubmit sitemap
    try:
        svc_rw.sitemaps().submit(siteUrl=SITE, feedpath=f'{BASE_URL}/sitemap.xml').execute()
        print("✓ Sitemap resubmitted")
    except Exception as e:
        print(f"Sitemap error: {e}")

    # Get sitemap status
    sitemap = get_sitemap_status(svc_ro)
    print(f"Sitemap: {sitemap.get('submitted',0)} submitted, {sitemap.get('indexed',0)} indexed")

    # Request indexing for all live pages (URL Inspection API)
    print(f"\nRequesting indexing for {len(live_pages)} pages...")
    print("(This may take a few minutes due to API rate limits)")
    indexing_results = request_indexing(svc_ro, live_pages, delay=1.5)
    print(f"  ✓ Already indexed: {len(indexing_results['indexed'])}")
    print(f"  ⏳ Pending/crawled: {len(indexing_results['submitted'])}")
    print(f"  ✗ Errors: {len(indexing_results['errors'])}")
    for e in indexing_results['errors']:
        print(f"    {e['url']}: {e['error']}")

    # Get performance
    perf = get_performance_summary(svc_ro)
    print(f"\nPerformance: {perf.get('total_clicks',0)} clicks, {perf.get('total_impressions',0)} impressions")

    # Build and send report
    html = build_html_report(date_str, live_pages, indexing_results, perf, sitemap)
    subject = f"SlotWatch SEO — {len(indexing_results['indexed'])} indexed / {len(live_pages)} live — {date_str}"
    send_report(subject, html)

    print("\n✓ Done")


if __name__ == '__main__':
    main()
