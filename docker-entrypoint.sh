#!/bin/sh
set -e

DATA_PATH="${PERSISTENT_DATA_PATH:-/data}"

mkdir -p "$DATA_PATH/storage/agents"

# Volumes montados pelo Coolify/Docker costumam ser root — ajusta permissões
chown -R nextjs:nodejs "$DATA_PATH"

exec su-exec nextjs "$@"
