#!/bin/bash
set -e

echo "[DEV] Restarting development containers..."
docker compose -f docker-compose.dev.yml down || true
docker compose -f docker-compose.dev.yml up -d

echo "[DEV] Checking service status..."
docker compose -f docker-compose.dev.yml ps

echo "[DEV] Development deployment complete."
