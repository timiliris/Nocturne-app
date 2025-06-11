FROM node:18-bullseye

# Installer Python, pip, yt-dlp, ffmpeg
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg netcat \
  && pip3 install yt-dlp \
  && apt-get clean

WORKDIR /app

# Copier les dépendances en premier pour optimiser le cache
COPY package*.json ./
RUN npm install

# Copier tout le reste, y compris le schéma Prisma
COPY . .
COPY prisma ./prisma

# Entrypoint pour exécuter les migrations avant le lancement
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

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

ENTRYPOINT ["/app/entrypoint.sh"]
