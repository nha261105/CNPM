#!/bin/bash
set -e

DOCKER_USER=${DOCKER_USER:-your-dockerhub-username}

# Use the correct compose file for production
docker_compose_file="docker-compose.prod.yml"

if [ ! -f "$docker_compose_file" ]; then
  echo "[PROD] $docker_compose_file not found!"
  exit 1
fi

echo "[PROD] Pulling latest images..."
docker pull $DOCKER_USER/smartbus-backend:latest
docker pull $DOCKER_USER/smartbus-frontend:latest

echo "[PROD] Restarting production containers..."
docker compose -f $docker_compose_file down || true
docker compose -f $docker_compose_file up -d

echo "[PROD] Running database migrations (if needed)..."
docker exec backend_prod_container npm run migrate || true

echo "[PROD] Production deployment complete."
