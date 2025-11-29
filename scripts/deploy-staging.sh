if [ ! -f frontend/.env.local ]; then
	if [ -f frontend/.env.example ]; then
		echo "[STAGING] frontend/.env.local not found, copying from .env.example..."
		cp frontend/.env.example frontend/.env.local
	else
		echo "[STAGING] frontend/.env.example not found! Please add this file."
		exit 1
	fi
fi
#!/bin/bash
set -e

DOCKER_USER=${DOCKER_USER:-thanhhai151200}

echo "[STAGING] Pulling latest images..."
docker pull $DOCKER_USER/smartbus-backend:latest
docker pull $DOCKER_USER/smartbus-frontend:latest

echo "[STAGING] Restarting staging containers..."
docker compose -f docker-compose.dev.yml down || true
docker compose -f docker-compose.dev.yml up -d

echo "[STAGING] Checking service status..."
docker compose -f docker-compose.dev.yml ps

echo "[STAGING] Staging deployment complete."
