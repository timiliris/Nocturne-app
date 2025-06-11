# Étape 1 : Build Angular/Ionic
FROM node:20.6.1 AS build

WORKDIR /app

# Installer dépendances
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Remplacer les variables dans les fichiers si nécessaire (optionnel)
ARG API_URL
ENV API_URL=${API_URL}
RUN node scripts/env-replace.js || true

# Build Angular/Ionic
RUN npm run build
# Étape 2 : Serveur Nginx avec injection dynamique d'environnement
FROM nginx:alpine

# Supprimer la conf Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/www /usr/share/nginx/html

# Copier la conf Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/

# Copier les fichiers d’environnement dynamique
COPY env.template.js /usr/share/nginx/html/env.template.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exposer le port
EXPOSE 8100

# Lancer le script d’entrée
ENTRYPOINT ["/entrypoint.sh"]
