FROM node:20-alpine

# Installer dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    bash \
    shadow \
    netcat-openbsd \
    openssl

# Installer yt-dlp dans un virtualenv Python (optionnel)
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copier package.json et prisma avant npm install (pour cache Docker)
COPY package*.json ./
COPY prisma ./prisma

# Installer dépendances Node.js
RUN npm install --legacy-peer-deps

# Générer Prisma client
RUN npx prisma generate

# Copier le reste de l'application
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "echo \"⏳ Waiting for database...\" && until nc -z db 5432; do sleep 1; done && echo \"🚀 Running migrations...\" && npx prisma migrate deploy && echo \"🟢 Starting server...\" && node src/server.js"]
