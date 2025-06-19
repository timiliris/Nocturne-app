#!/bin/sh

ENV_PATH="/app/.env"

# ✅ Charger les variables du fichier .env
if [ -f "$ENV_PATH" ]; then
  echo "📦 Chargement de $ENV_PATH"
  set -o allexport
  . "$ENV_PATH"
  set +o allexport
else
  echo "⚠️ Aucun fichier .env trouvé à $ENV_PATH"
fi

# ✅ Définir les variables avec fallback
MEILI_ENV=${MEILI_ENV:-production}
MEILI_MASTER_KEY=${MEILI_MASTER_KEY:-""}
MEILI_ADMIN_KEY=${MEILI_ADMIN_KEY:-""}
MEILI_SEARCH_KEY=${MEILI_SEARCH_KEY:-""}
MEILI_DASHBOARD=${MEILI_DASHBOARD:-false}
MEILI_NO_ANALYTICS=${MEILI_NO_ANALYTICS:-true}

# Fonction pour récupérer une clé par description sur l'instance MeiliSearch
get_key_by_description() {
  DESC=$1
  curl -s -X GET http://localhost:7700/keys \
    -H "Authorization: Bearer $MEILI_MASTER_KEY" | \
    jq -r --arg desc "$DESC" '.results[] | select(.description == $desc) | .key // empty'
}

# Si on a une clé master on peut tenter de récupérer les clés admin et search
if [ -n "$MEILI_MASTER_KEY" ]; then
  echo "🔍 Tentative de récupération des clés existantes depuis l'instance MeiliSearch..."

  ADMIN_KEY=$(get_key_by_description "meili-admin")
  SEARCH_KEY=$(get_key_by_description "meili-search")

  if [ -n "$ADMIN_KEY" ] && [ -n "$SEARCH_KEY" ]; then
    echo "✅ Clés Meilisearch récupérées depuis l’instance :"
    echo "MEILI_ADMIN_KEY=$ADMIN_KEY"
    echo "MEILI_SEARCH_KEY=$SEARCH_KEY"
    # On exporte pour que ce soit accessible dans la suite
    export MEILI_ADMIN_KEY="$ADMIN_KEY"
    export MEILI_SEARCH_KEY="$SEARCH_KEY"
  else
    echo "⚠️ Clés admin ou search non trouvées sur l’instance."
  fi
fi

# Si les clés admin et search sont présentes (depuis .env ou récupération)
if [ -n "$MEILI_ADMIN_KEY" ] && [ -n "$MEILI_SEARCH_KEY" ]; then
  echo "✅ Clés Meilisearch prêtes (admin & search)"
  echo "🚀 Démarrage de Meilisearch en mode $MEILI_ENV..."
  exec meilisearch
fi

# 🛠️ Sinon, on démarre Meilisearch en fond pour générer les clés
echo "🛠️ Démarrage de Meilisearch pour générer les clés..."

meilisearch &

# 📡 Attente de la disponibilité de Meilisearch
until curl -s http://localhost:7700/health | grep '"status":"available"' > /dev/null; do
  echo "⏳ En attente de Meilisearch..."
  sleep 1
done

echo "✅ Meilisearch est prêt"

EXPIRES_AT="2099-12-31T23:59:59Z"

create_key() {
  DESCRIPTION=$1
  ACTIONS=$2

  RESPONSE=$(curl -s -X POST http://localhost:7700/keys \
    -H "Authorization: Bearer $MEILI_MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "description": "'"$DESCRIPTION"'",
      "actions": '"$ACTIONS"',
      "indexes": ["*"],
      "expiresAt": "'"$EXPIRES_AT"'"
    }')

  echo "$RESPONSE" | jq -r .key
}

ADMIN_KEY=$(create_key "meili-admin" '["*"]')
SEARCH_KEY=$(create_key "meili-search" '["search"]')

# ❌ Échec si une des deux clés est invalide
if [ -z "$ADMIN_KEY" ] || [ "$ADMIN_KEY" = "null" ] || [ -z "$SEARCH_KEY" ] || [ "$SEARCH_KEY" = "null" ]; then
  echo "❌ Échec de la génération des clés"
  kill %1 2>/dev/null
  exit 1
fi

# 📝 Affichage manuel des clés à copier
echo ""
echo "🚨 IMPORTANT 🚨"
echo "Les clés Meilisearch ont été générées automatiquement mais ne sont PAS enregistrées dans .env"
echo "Merci de les copier dans votre fichier .env :"
echo ""
echo "MEILI_ADMIN_KEY=$ADMIN_KEY"
echo "MEILI_SEARCH_KEY=$SEARCH_KEY"
echo ""

# 🔚 On tue le processus en fond et relance avec les bons paramètres
kill %1 2>/dev/null

# ✅ Lancement final de Meilisearch avec les bons paramètres d’environnement
echo "🚀 Démarrage final de Meilisearch en mode $MEILI_ENV..."
exec meilisearch
