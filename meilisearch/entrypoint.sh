#!/bin/sh

ENV_PATH="/app/.env"

# Function to read a variable from the .env file
get_env_var() {
  VAR_NAME=$1
  grep "^$VAR_NAME=" "$ENV_PATH" 2>/dev/null | cut -d '=' -f2-
}

MEILI_ADMIN_KEY=$(get_env_var "MEILI_ADMIN_KEY")
MEILI_SEARCH_KEY=$(get_env_var "MEILI_SEARCH_KEY")

if [ -n "$MEILI_ADMIN_KEY" ] && [ -n "$MEILI_SEARCH_KEY" ]; then
  echo "✅ Meilisearch keys already exist"
  echo "✅ Meilisearch will start normally"
  exec meilisearch
fi

# Otherwise, start Meilisearch in the background to create keys via the API
meilisearch &

# Wait for Meilisearch to be ready
until curl -s http://localhost:7700/health | grep '"status":"available"' > /dev/null; do
  echo "⏳ Waiting for Meilisearch..."
  sleep 1
done

echo "✅ Meilisearch is up and running"

EXPIRES_AT="2099-12-31T23:59:59Z"
MASTER_KEY="$MEILI_MASTER_KEY"

create_key() {
  NAME=$1
  ACTIONS=$2

  RESPONSE=$(curl -s -X POST http://localhost:7700/keys \
    -H "Authorization: Bearer $MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'"$NAME"'",
      "actions": '"$ACTIONS"',
      "indexes": ["*"],
      "expiresAt": "'"$EXPIRES_AT"'"
    }')

  echo "$RESPONSE" | jq -r .key
}

ADMIN_KEY=$(create_key "meili-admin" '["*"]')
SEARCH_KEY=$(create_key "meili-search" '["search"]')

if [ -z "$ADMIN_KEY" ] || [ "$ADMIN_KEY" = "null" ] || [ -z "$SEARCH_KEY" ] || [ "$SEARCH_KEY" = "null" ]; then
  echo "❌ Failed to create keys."
  exit 1
fi

echo ""
echo "🚨 IMPORTANT 🚨"
echo "Meilisearch keys have been generated automatically but NOT written to your .env file."
echo "Please add them manually to your .env file:"
echo ""
echo "MEILI_ADMIN_KEY=$ADMIN_KEY"
echo "MEILI_SEARCH_KEY=$SEARCH_KEY"
echo ""
echo "Then restart 'docker-compose up' so services can use these keys."
echo ""

# Stop Meilisearch started in background (user will restart later)
kill %1 2>/dev/null

exit 0
