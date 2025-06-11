#!/bin/sh

# Attendre que la base soit prête
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  sleep 1
done

# Appliquer les migrations
echo "🚀 Running migrations..."
npx prisma migrate deploy

# Lancer le serveur
echo "🟢 Starting server..."
exec node src/server.js
