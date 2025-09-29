#!/bin/bash

# Docker build script that securely passes environment variables as build arguments
# Reads from .env.docker without exposing keys in package.json or git history

set -e

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo "Error: .env.docker file not found!"
    echo "Please create .env.docker with your Docker environment variables"
    exit 1
fi

# Source the environment file
set -a
source .env.docker
set +a

# Build Docker image with build arguments from environment
# Only pass public variables that are safe to embed in client bundle
# Run from repository root to access library/ subdirectory
cd ..
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -f library/Dockerfile \
    -t library-app \
    .

echo "Docker build completed successfully!"
echo "Run with: npm run docker:run"