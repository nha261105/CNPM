
#!/bin/bash
set -euo pipefail

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

set -e

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Enhanced environment setup
setup_environment() {
    log_info "Setting up environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        log_info "Creating backend/.env from example..."
        cp backend/.env.example backend/.env
        log_success "Backend .env created"
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        if [ -f frontend/.env.example ]; then
            log_info "Creating frontend/.env.local from example..."
            cp frontend/.env.example frontend/.env.local
            log_success "Frontend .env.local created"
        else
            log_error "frontend/.env.example not found!"
            exit 1
        fi
    fi
}

# Smart container management
manage_containers() {
    log_info "Managing containers intelligently..."
    
    # Jenkins container check removed to prevent unwanted restarts
    
    # Stop and remove only app containers
    log_info "Stopping application containers..."
    docker compose -f docker-compose.dev.yml stop backend frontend 2>/dev/null || true
    docker compose -f docker-compose.dev.yml rm -f backend frontend 2>/dev/null || true
    
    # Start app containers without dependencies
    log_info "Starting application containers..."
    docker compose -f docker-compose.dev.yml up -d --no-deps backend frontend
    
    # Quick status check
    sleep 5
    docker compose -f docker-compose.dev.yml ps backend frontend
}

# Comprehensive health checks
health_check() {
    log_info "Running comprehensive health checks..."
    
    # Backend health check
    log_info "Checking backend health..."
    for i in {1..20}; do
        if curl -sf http://localhost:5000/api/health >/dev/null 2>&1; then
            log_success "Backend is healthy (attempt $i)"
            break
        fi
        if [ $i -eq 20 ]; then
            log_error "Backend health check failed"
            docker compose -f docker-compose.dev.yml logs backend --tail=20
            exit 1
        fi
        sleep 3
    done
    
    # Frontend health check
    log_info "Checking frontend health..."
    for i in {1..15}; do
        if curl -sf http://localhost:3000 >/dev/null 2>&1; then
            log_success "Frontend is healthy (attempt $i)"
            break
        fi
        if [ $i -eq 15 ]; then
            log_warning "Frontend health check failed, but continuing..."
            docker compose -f docker-compose.dev.yml logs frontend --tail=20
        fi
        sleep 3
    done
}

# Performance monitoring
monitor_performance() {
    log_info "Collecting performance metrics..."
    
    # Container stats
    echo "=== Container Resource Usage ==="
    docker compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    # Quick memory/CPU check
    echo "=== System Resources ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || true
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log_info "🚀 Starting enhanced development deployment..."
    
    setup_environment
    manage_containers
    health_check
    monitor_performance
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "🎉 Deployment completed successfully in ${duration}s!"
    log_info "📊 Services are running at:"
    log_info "   - Backend API: http://localhost:5000"
    log_info "   - Frontend: http://localhost:3000"
}

# Trap errors for cleanup
trap 'log_error "Deployment failed! Check logs above for details."' ERR

# Execute main function
main "$@"
