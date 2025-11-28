
#!/bin/bash
# Tự động tạo backend/.env nếu chưa có
if [ ! -f backend/.env ]; then
	echo "[DEV] backend/.env not found, copying from .env.example..."
	cp backend/.env.example backend/.env
fi

# Tự động tạo frontend/.env.local nếu chưa có
if [ ! -f frontend/.env.local ]; then
	echo "[DEV] frontend/.env.local not found, copying from .env.example..."
	cp frontend/.env.example frontend/.env.local
fi
#!/bin/bash
set -e


echo "[DEV] Restarting backend & frontend containers..."
# Chỉ dừng và xóa backend, frontend, KHÔNG động vào jenkins_dev
docker compose -f docker-compose.dev.yml stop backend frontend || true
docker compose -f docker-compose.dev.yml rm -f backend frontend || true
docker compose -f docker-compose.dev.yml up -d backend frontend

echo "[DEV] Checking service status..."
docker compose -f docker-compose.dev.yml ps

echo "[DEV] Development deployment complete."
