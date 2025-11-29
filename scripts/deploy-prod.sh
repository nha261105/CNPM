# Tự động tạo frontend/.env.local nếu chưa có
if [ ! -f frontend/.env.local ]; then
  if [ -f frontend/.env.example ]; then
    echo "[PROD] frontend/.env.local not found, copying from .env.example..."
    cp frontend/.env.example frontend/.env.local
  else
    echo "[PROD] frontend/.env.example not found! Please add this file."
    exit 1
  fi
fi
#!/bin/bash
set -e

DOCKER_USER=${DOCKER_USER:-thanhhai151200}

# Use the correct compose file for production
docker_compose_file="docker-compose.prod.yml"

if [ ! -f "$docker_compose_file" ]; then
  echo "[PROD] $docker_compose_file not found!"
  exit 1
fi

echo "[PROD] Pulling latest images..."
docker pull $DOCKER_USER/smartbus-backend:latest
docker pull $DOCKER_USER/smartbus-frontend:latest

echo "[PROD] Restarting backend/frontend containers (no Jenkins downtime)..."
docker compose -f $docker_compose_file up -d backend frontend

echo "[PROD] Running database migrations (if needed)..."
docker exec backend_prod_container npm run migrate || true

echo "[PROD] Production deployment complete."
