#!/bin/sh
set -e

echo "Env vars:"
env

echo "Generate env.js from env.template.js"
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

echo "Starting nginx"
exec nginx -g 'daemon off;'
