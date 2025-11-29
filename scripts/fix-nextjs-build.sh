#!/bin/bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${YELLOW}[FIX]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🔧 Fixing Next.js Build Issues..."

# Fix 1: Ensure all scripts are executable
log_info "Making all scripts executable..."
chmod +x scripts/*.sh
log_success "Scripts permissions fixed"

# Fix 2: Clean Next.js cache and node_modules if needed
if [ -d "frontend/.next" ]; then
    log_info "Cleaning Next.js cache..."
    rm -rf frontend/.next
    log_success "Next.js cache cleaned"
fi

# Fix 3: Check for any problematic imports
log_info "Checking for problematic imports in source files..."
if find frontend/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "next/document\|Html.*from.*next" 2>/dev/null; then
    log_error "Found problematic Next.js imports! Please fix manually."
else
    log_success "No problematic imports found"
fi

# Fix 4: Test build in development mode
log_info "Testing Next.js build..."
cd frontend
if npm run build > /tmp/nextjs-build.log 2>&1; then
    log_success "Next.js build successful!"
else
    log_error "Next.js build failed. Check log:"
    tail -20 /tmp/nextjs-build.log
    cd ..
    exit 1
fi
cd ..

log_success "🎉 All Next.js issues fixed!"
echo "✅ Ready to run Jenkins pipeline again"