#!/bin/bash
# Usage: ./scripts/provision.sh <user-id> <instance-secret>
# Called by the API after Stripe payment confirmed

USER_ID=$1
INSTANCE_SECRET=$2
FLY_APP="slotwatch-instances"

echo "Provisioning machine for user $USER_ID..."

RESPONSE=$(curl -s -X POST \
  "https://api.machines.dev/v1/apps/$FLY_APP/machines" \
  -H "Authorization: Bearer $FLY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"config\": {
      \"image\": \"registry.fly.io/slotwatch:latest\",
      \"env\": {
        \"INSTANCE_SECRET\": \"$INSTANCE_SECRET\",
        \"DATA_DIR\": \"/data\"
      },
      \"services\": [{
        \"internal_port\": 3001,
        \"protocol\": \"tcp\",
        \"ports\": [{\"port\": 443, \"handlers\": [\"tls\", \"http\"]}]
      }],
      \"mounts\": [{\"volume\": \"auto\", \"path\": \"/data\"}]
    }
  }")

MACHINE_ID=$(echo $RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "Machine ID: $MACHINE_ID"
echo "Dashboard URL: https://$MACHINE_ID.fly.dev"
