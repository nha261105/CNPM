#!/bin/bash

# 🔧 Script tự động cài đặt Node.js trong Jenkins Container
# Sử dụng: ./install-nodejs-jenkins.sh

set -e

echo "🔍 Finding Jenkins container..."

# Find Jenkins container ID
JENKINS_CONTAINER=$(docker ps --filter "name=jenkins" --format "{{.ID}}" | head -n 1)

if [ -z "$JENKINS_CONTAINER" ]; then
    echo "❌ Jenkins container not found!"
    echo "Please make sure Jenkins is running with 'docker ps'"
    exit 1
fi

echo "✅ Found Jenkins container: $JENKINS_CONTAINER"

echo ""
echo "📦 Installing Node.js 22.x in Jenkins container..."

# Install Node.js in Jenkins container
docker exec -u root $JENKINS_CONTAINER bash -c '
    echo "Updating package manager..."
    apt-get update -qq
    
    echo "Installing curl..."
    apt-get install -y curl -qq
    
    echo "Adding NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    
    echo "Installing Node.js..."
    apt-get install -y nodejs -qq
    
    echo "Updating npm to latest..."
    npm install -g npm@latest --silent
    
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "Node.js version:"
    node --version
    echo ""
    echo "npm version:"
    npm --version
    
    echo ""
    echo "Fixing permissions..."
    chown -R jenkins:jenkins /var/jenkins_home/.npm || true
'

echo ""
echo "🎉 Node.js has been successfully installed in Jenkins!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to Jenkins UI: http://localhost:8081"
echo "   2. Trigger a new build"
echo "   3. Check console output for Node.js version"
echo ""
echo "⚠️  Note: If you recreate the Jenkins container, you'll need to run this script again"
echo "    Consider using NodeJS Plugin for permanent installation"
echo ""
