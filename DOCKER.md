# Docker Deployment Guide

This document explains how to build and run the library management system using Docker.

## Overview

The application uses a multi-stage Docker build process optimized for production deployment. The build system securely handles environment variables and creates a standalone Next.js application.

## Build Script (`docker-build.sh`)

The `docker-build.sh` script automates the Docker build process with the following features:

- **Secure environment handling**: Reads variables from `.env.docker` without exposing them in git history
- **Build argument passing**: Safely passes only public environment variables to the Docker build
- **Multi-stage optimization**: Uses Docker's multi-stage builds for smaller production images
- **Standalone output**: Creates a self-contained application bundle

### How it works:

1. Validates that `.env.docker` exists
2. Sources environment variables from `.env.docker`
3. Builds Docker image from repository root (required for proper file context)
4. Passes only public Supabase variables as build arguments
5. Creates a production-optimized image tagged as `library-app`

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- `.env.docker` file configured with your production Supabase credentials

### Build and Run

```bash
# Navigate to the project root
cd project-root/

# Build the Docker image
npm run docker:build

# Run the production container
npm run docker:run
```

## Environment Configuration

Create `.env.docker` in the `project-root/` directory:

```env
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Environment
NODE_ENV=production
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker image using build script |
| `npm run docker:run` | Run production container on port 3000 |

## Docker Image Details

- **Base Image**: Node.js 20 Alpine Linux
- **Port**: 3001
- **Build Type**: Standalone Next.js application
- **Optimization**: Multi-stage build with production dependencies only

## Troubleshooting

### Build Fails
- Ensure `.env.docker` exists with valid Supabase credentials
- Verify Docker Desktop is running
- Run from the `project-root/` directory

### Container Won't Start
- Check that port 3001 is available
- Verify environment variables in `.env.docker`
- Check Docker logs: `docker logs <container-id>`

## Security Notes

- Only public environment variables (NEXT_PUBLIC_*) are embedded in the client bundle
- Private keys should never be included in build arguments
- The build script prevents accidental exposure of sensitive data

## Docker Hub Deployment 
The Docker image can be pushed to Docker Hub for easy deployment.

## Docker Image pull
You can pull the pre-built Docker image from Docker Hub:

```bash
docker pull username/library-app:latest # Replace 'username' with the actual Docker Hub username
```

## Run the pre-built Docker image

```bash
docker run -d --name library-app -p 3001:3001 username/library-app:latest # Replace 'username' with the actual Docker Hub username
```
Be sure your desktop Docker is running. 

The application Image will be available at `http://localhost:3001`.
