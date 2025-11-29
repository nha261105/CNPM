#!/bin/bash
set -euo pipefail

# Advanced CI/CD Auto-Fix Script
# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_fix() { echo -e "${PURPLE}[FIX]${NC} $1"; }

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                 🚀 CI/CD AUTO-FIX SYSTEM                ║${NC}"
echo -e "${CYAN}║              Perfect CI/CD Optimization                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"

# System cleanup function
cleanup_system() {
    log_info "🧹 Cleaning up system resources..."
    
    # Clean Docker system
    docker system prune -f --volumes 2>/dev/null || true
    docker builder prune -f 2>/dev/null || true
    
    # Clean npm caches
    npm cache clean --force 2>/dev/null || true
    
    log_success "System cleanup completed"
}

# Advanced container conflict resolution
resolve_conflicts() {
    log_fix "🔧 Resolving container conflicts..."
    
    # Stop all related containers gracefully
    local containers=("jenkins_dev" "backend_dev" "frontend_dev")
    for container in "${containers[@]}"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            log_info "Stopping container: ${container}"
            docker stop "${container}" 2>/dev/null || true
            docker rm -f "${container}" 2>/dev/null || true
        fi
    done
    
    # Clean up orphaned containers
    docker container prune -f 2>/dev/null || true
    
    log_success "Container conflicts resolved"
}

# Smart dependency management
optimize_dependencies() {
    log_fix "📦 Optimizing dependencies..."
    
    # Backend optimization
    if [ -d "backend" ]; then
        cd backend
        if [ -f "package.json" ]; then
            log_info "Optimizing backend dependencies..."
            npm ci --cache /tmp/npm-cache --prefer-offline --no-audit --no-fund || npm install
        fi
        cd ..
    fi
    
    # Frontend optimization
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            log_info "Optimizing frontend dependencies..."
            npm ci --cache /tmp/npm-cache --prefer-offline --no-audit --no-fund || npm install
            # Install Sharp if needed
            npm install sharp 2>/dev/null || true
        fi
        cd ..
    fi
    
    log_success "Dependencies optimized"
}

# Network optimization
optimize_network() {
    log_fix "🌐 Optimizing Docker networks..."
    
    # Clean up unused networks
    docker network prune -f 2>/dev/null || true
    
    # Recreate smartbus network if needed
    if ! docker network ls | grep -q "smartbus-network"; then
        docker network create smartbus-network 2>/dev/null || true
    fi
    
    log_success "Network optimization completed"
}

# Performance monitoring setup
setup_monitoring() {
    log_fix "📊 Setting up performance monitoring..."
    
    # Create monitoring directory
    mkdir -p monitoring
    
    # Create performance monitor script
    cat > monitoring/performance.sh << 'EOF'
#!/bin/bash
echo "=== CI/CD Performance Report ===" 
echo "Timestamp: $(date)"
echo "Docker Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo -e "\nContainer Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo -e "\nSystem Resources:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "Stats not available"
EOF
    
    chmod +x monitoring/performance.sh
    log_success "Performance monitoring setup completed"
}

# Health check enhancement
enhance_health_checks() {
    log_fix "🏥 Enhancing health checks..."
    
    # Update existing health check script with advanced features
    if [ -f "scripts/health-check.sh" ]; then
        # Backup original
        cp scripts/health-check.sh scripts/health-check.sh.backup
    fi
    
    # Create enhanced health check
    cat > scripts/health-check-enhanced.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# Enhanced Health Check System
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-15}
    local timeout=${4:-5}
    
    echo "🔍 Checking $service_name health..."
    
    for i in $(seq 1 $max_attempts); do
        if timeout $timeout curl -sf "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is healthy (attempt $i/$max_attempts)"
            return 0
        fi
        
        if [ $i -eq $max_attempts ]; then
            echo "❌ $service_name health check failed after $max_attempts attempts"
            return 1
        fi
        
        echo "⏳ Waiting for $service_name... (attempt $i/$max_attempts)"
        sleep 2
    done
}

main() {
    echo "🚀 Starting enhanced health checks..."
    
    # Check Jenkins
    check_service "Jenkins" "http://localhost:8081/jenkins/login" 10 3
    
    # Check backend
    check_service "Backend API" "http://localhost:5000/api/health" 15 5
    
    # Check frontend
    check_service "Frontend" "http://localhost:3000" 10 3
    
    echo "✅ All health checks passed!"
}

main "$@"
EOF
    
    chmod +x scripts/health-check-enhanced.sh
    log_success "Health checks enhanced"
}

# Auto-fix main function
main() {
    local start_time=$(date +%s)
    
    log_info "🎯 Starting comprehensive CI/CD auto-fix process..."
    
    cleanup_system
    resolve_conflicts
    optimize_network
    optimize_dependencies
    setup_monitoring
    enhance_health_checks
    
    # Final system validation
    log_info "🔍 Running final validation..."
    
    # Check Docker
    if ! docker --version >/dev/null 2>&1; then
        log_error "Docker not available"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose not available"
        exit 1
    fi
    
    # Check scripts
    local scripts=("deploy-dev.sh" "cleanup-containers.sh" "health-check-enhanced.sh")
    for script in "${scripts[@]}"; do
        if [ ! -x "scripts/$script" ]; then
            log_warning "Making $script executable"
            chmod +x "scripts/$script" 2>/dev/null || true
        fi
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  🎉 AUTO-FIX COMPLETED                   ║${NC}"
    echo -e "${GREEN}║              Duration: ${duration}s                               ║${NC}"
    echo -e "${GREEN}║          Your CI/CD is now optimized!                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    
    log_success "🚀 Next steps:"
    log_info "   1. Run: bash scripts/cleanup-containers.sh"
    log_info "   2. Run: bash scripts/deploy-dev.sh" 
    log_info "   3. Trigger Jenkins build"
    log_info "   4. Monitor: bash monitoring/performance.sh"
}

# Trap errors
trap 'log_error "Auto-fix failed! Check the error above."' ERR

# Execute
main "$@"