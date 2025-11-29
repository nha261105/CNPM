#!/bin/bash
# Script để dọn dẹp containers bị conflict

echo "🧹 Dọn dẹp containers bị conflict..."

# Dừng và xóa tất cả containers có liên quan
echo "Stopping all related containers..."
docker stop $(docker ps -q --filter "name=jenkins_dev") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=backend_dev") 2>/dev/null || true  
docker stop $(docker ps -q --filter "name=frontend_dev") 2>/dev/null || true

echo "Removing conflicted containers..."
docker rm -f $(docker ps -aq --filter "name=jenkins_dev") 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=backend_dev") 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=frontend_dev") 2>/dev/null || true

# Dọn dẹp networks
echo "Cleaning up networks..."
docker network prune -f

echo "✅ Cleanup completed! Now you can restart containers safely."

# Khởi động lại Jenkins trước
echo "🚀 Starting Jenkins container..."
docker compose -f docker-compose.dev.yml up -d jenkins

# Chờ Jenkins khởi động
echo "⏳ Waiting for Jenkins to be healthy..."
for i in {1..30}; do
    if docker compose -f docker-compose.dev.yml ps jenkins | grep -q "healthy"; then
        echo "✅ Jenkins is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️ Jenkins took too long to start"
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 10
done

echo "🎯 Run 'bash scripts/deploy-dev.sh' to deploy your application"