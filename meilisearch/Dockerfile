FROM getmeili/meilisearch:latest

ENV MEILI_DB_PATH=/meili_data

RUN apk add --no-cache curl jq

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/meili_data"]

EXPOSE 7700

ENTRYPOINT ["/entrypoint.sh"]
