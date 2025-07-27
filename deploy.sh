#!/bin/bash

# FrameGen AI Deployment Script
# This script sets up and deploys the FrameGen AI application

set -e

echo "🎨 FrameGen AI Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads outputs

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads outputs

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected. You can also deploy using Docker:"
    echo "   docker-compose up -d"
fi

# Start the application
echo "🚀 Starting FrameGen AI..."
echo "   The application will be available at: http://localhost:3001"
echo "   Press Ctrl+C to stop the server"
echo ""

npm start 