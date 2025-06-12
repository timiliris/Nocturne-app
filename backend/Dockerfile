FROM node:20-bullseye

# Installer Python, pip, yt-dlp, ffmpeg, netcat
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg netcat \
  && pip3 install yt-dlp \
  && apt-get clean

WORKDIR /app

# Copier les dépendances et installer
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copier le reste du code
COPY . .
COPY prisma ./prisma

# Variables d'environnement
ARG GLOBAL_USERNAME
ARG GLOBAL_PASSWORD
ARG DATABASE_PROVIDER
ARG DATABASE_URL
ARG FRONTEND_URL
ARG SESSION_SECRET
ARG API_HOST
ARG API_PORT

ENV DATABASE_PROVIDER=${DATABASE_PROVIDER}
ENV DATABASE_URL=${DATABASE_URL}
ENV GLOBAL_USERNAME=${GLOBAL_USERNAME}
ENV GLOBAL_PASSWORD=${GLOBAL_PASSWORD}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV API_HOST=${API_HOST}
ENV API_PORT=${API_PORT}

EXPOSE 3000

# Commande de lancement avec attente + migrations + démarrage
CMD sh -c '\
  echo "⏳ Waiting for database..." && \
  until nc -z db 5432; do sleep 1; done && \
  echo "🚀 Running migrations..." && \
  npx prisma migrate deploy && \
  echo "🟢 Starting server..." && \
  npm install --legacy-peer-deps && \
  node src/server.js'

