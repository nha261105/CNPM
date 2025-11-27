#!/bin/bash
set -e

DOCKER_USER=${DOCKER_USER:-your-dockerhub-username}

echo "[STAGING] Pulling latest images..."
docker pull $DOCKER_USER/smartbus-backend:latest
docker pull $DOCKER_USER/smartbus-frontend:latest

echo "[STAGING] Restarting staging containers..."
docker compose -f docker-compose.dev.yml down || true
docker compose -f docker-compose.dev.yml up -d

echo "[STAGING] Checking service status..."
docker compose -f docker-compose.dev.yml ps

echo "[STAGING] Staging deployment complete."
