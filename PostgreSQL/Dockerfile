# Utiliser l'image officielle PostgreSQL
FROM postgres:15

# Variables d'environnement (à adapter)
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase

# Copier un script d'initialisation SQL si besoin (optionnel)
# COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose le port par défaut de PostgreSQL
EXPOSE 5432
