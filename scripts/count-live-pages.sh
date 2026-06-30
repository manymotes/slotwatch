#!/bin/bash
TODAY=$(date +%Y-%m-%d)
echo "=== SlotWatch pSEO Status ==="
echo "Date: $TODAY"
# Count from the lib file (approximate)
echo "Run: node -e \"const {SERVICE_CENTERS}=require('./apps/web/lib/service-centers.ts'); const today='$TODAY'; console.log('Live:', SERVICE_CENTERS.filter(c=>c.releaseDate<=today).length, '/ Total:', SERVICE_CENTERS.length)\""
