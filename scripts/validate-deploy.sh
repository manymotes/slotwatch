#!/bin/bash
set -e

SITE=${1:-"https://slotwatch-web.pages.dev"}
echo "Validating $SITE"

# Check homepage
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/")
[ "$STATUS" = "200" ] && echo "✓ Homepage: 200" || { echo "✗ Homepage: $STATUS"; exit 1; }

# Check a known pSEO page
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/los-angeles-tesla-service/")
[ "$STATUS" = "200" ] && echo "✓ LA pSEO page: 200" || echo "⚠ LA page: $STATUS (may not be deployed yet)"

# Check API
RESULT=$(curl -s -X POST "$SITE/api/notify" -H "Content-Type: application/json" -d '{"email":"test@test.com"}')
echo "$RESULT" | grep -q '"ok"' && echo "✓ Email API: responding" || echo "⚠ Email API: $RESULT"

# Count pSEO pages in sitemap
PAGE_COUNT=$(curl -s "$SITE/sitemap.xml" | grep -c "<loc>" || echo 0)
echo "✓ Sitemap: $PAGE_COUNT URLs"

echo ""
echo "Validation complete for $SITE"
