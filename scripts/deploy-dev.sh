
#!/bin/bash
# Tự động tạo backend/.env nếu chưa có
if [ ! -f backend/.env ]; then
	echo "[DEV] backend/.env not found, copying from .env.example..."
	cp backend/.env.example backend/.env
fi

# Tự động tạo frontend/.env.local nếu chưa có
if [ ! -f frontend/.env.local ]; then
	if [ -f frontend/.env.example ]; then
		echo "[DEV] frontend/.env.local not found, copying from .env.example..."
		cp frontend/.env.example frontend/.env.local
	else
		echo "[DEV] frontend/.env.example not found! Please add this file."
		exit 1
	fi
fi
#!/bin/bash
set -e

echo "[DEV] Stopping backend & frontend containers (keeping Jenkins running)..."
# Stop only backend and frontend containers, NOT Jenkins
docker compose -f docker-compose.dev.yml stop backend frontend || true
docker compose -f docker-compose.dev.yml rm -f backend frontend || true

echo "[DEV] Starting backend & frontend containers..."
# Start only backend and frontend, don't recreate Jenkins
docker compose -f docker-compose.dev.yml up -d backend frontend

echo "[DEV] Waiting for containers to be ready..."
sleep 10

echo "[DEV] Checking service status..."
docker compose -f docker-compose.dev.yml ps backend frontend

echo "[DEV] Running comprehensive health checks..."
if [ -f "scripts/health-check.sh" ]; then
    bash scripts/health-check.sh
else
    echo "[DEV] health-check.sh not found, using simple checks..."
    
    echo "[DEV] Verifying backend health..."
    for i in {1..30}; do
        if curl -f http://localhost:5000/api/health 2>/dev/null; then
            echo "[DEV] Backend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "[DEV] Warning: Backend health check failed after 30 attempts"
        fi
        sleep 2
    done

    echo "[DEV] Verifying frontend health..."
    for i in {1..15}; do
        if curl -f http://localhost:3000 2>/dev/null; then
            echo "[DEV] Frontend is healthy"
            break
        fi
        if [ $i -eq 15 ]; then
            echo "[DEV] Warning: Frontend health check failed after 15 attempts"
        fi
        sleep 2
    done
fi

echo "[DEV] Development deployment complete."
