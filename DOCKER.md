# Docker Setup Guide

This guide covers how to build and run optimized Docker containers for the XCC project.

## Quick Start

### Build the Optimized Container
```bash
docker build -f Dockerfile-bun -t xcc-bun .
```

### Run the Container
```bash
docker run -p 5173:5173 --name xcc-bun-container -d xcc-bun
```

### Check Container Status
```bash
# View logs
docker logs xcc-bun-container

# Check if container is running
docker ps

# Access the application
open http://localhost:5173
```

## Available Dockerfiles

### 1. Dockerfile-bun (Recommended - Optimized)
- **Size**: ~756MB (70% smaller than original)
- **Base**: `node:25-alpine` with Bun
- **Use Case**: Optimized development environment
- **Features**: 
  - Excludes heavy packages (`@iconify/json`, `@img/*`)
  - Uses Alpine Linux for smaller size
  - Clears package manager caches
  - Full SvelteKit compatibility

```bash
docker build -f Dockerfile-bun -t xcc-bun .
docker run -p 5173:5173 --name xcc-bun-container -d xcc-bun
```

### 2. Dockerfile (Original)
- **Size**: ~2.5GB
- **Base**: `node:25-slim` with Bun
- **Use Case**: Full development environment with all dependencies
- **Features**: Complete dependency set, guaranteed compatibility

```bash
docker build -t xcc-original .
docker run -p 5173:5173 --name xcc-original-container -d xcc-original
```

### 3. Dockerfile-production (Production Build)
- **Size**: Smaller runtime image
- **Base**: Multi-stage build with Node adapter
- **Use Case**: Production deployments
- **Features**: Built static files, production optimizations

```bash
docker build -f Dockerfile-production -t xcc-prod .
docker run -p 3000:3000 --name xcc-prod-container -d xcc-prod
```

## Container Management Commands

### Building Images
```bash
# Build optimized development image
docker build -f Dockerfile-bun -t xcc-bun .

# Build with custom tag
docker build -f Dockerfile-bun -t xcc-bun:v1.0.0 .

# Build without cache (force rebuild)
docker build --no-cache -f Dockerfile-bun -t xcc-bun .
```

### Running Containers
```bash
# Run in detached mode (background)
docker run -p 5173:5173 --name xcc-bun-container -d xcc-bun

# Run with volume mount for development (live reload)
docker run -p 5173:5173 --name xcc-bun-dev \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/static:/app/static \
  -d xcc-bun

# Run interactively (foreground)
docker run -p 5173:5173 --name xcc-bun-container xcc-bun

# Run with custom environment variables
docker run -p 5173:5173 --name xcc-bun-container \
  -e NODE_ENV=development \
  -e HOST=0.0.0.0 \
  -d xcc-bun
```

### Container Operations
```bash
# View container logs
docker logs xcc-bun-container

# Follow logs in real-time
docker logs -f xcc-bun-container

# Stop container
docker stop xcc-bun-container

# Start stopped container
docker start xcc-bun-container

# Restart container
docker restart xcc-bun-container

# Remove container
docker rm xcc-bun-container

# Stop and remove container
docker rm -f xcc-bun-container
```

### Debugging Commands
```bash
# Execute command in running container
docker exec -it xcc-bun-container sh

# Check container resource usage
docker stats xcc-bun-container

# Inspect container details
docker inspect xcc-bun-container

# View container file system changes
docker diff xcc-bun-container
```

## Image Management

### Viewing Images
```bash
# List all images
docker images

# List XCC images only
docker images | grep xcc

# Show image sizes sorted by size
docker images | grep xcc | sort -k7 -hr
```

### Cleaning Up
```bash
# Remove image
docker rmi xcc-bun

# Remove all unused images
docker image prune

# Remove all unused containers, networks, and images
docker system prune

# Remove everything (including volumes)
docker system prune -a --volumes
```

## Development Workflow

### 1. Local Development with Docker
```bash
# Build the image
docker build -f Dockerfile-bun -t xcc-bun .

# Run with volume mounts for live reload
docker run -p 5173:5173 --name xcc-dev \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/static:/app/static \
  -d xcc-bun

# Watch logs
docker logs -f xcc-dev
```

### 2. Testing Different Configurations
```bash
# Test optimized build
docker build -f Dockerfile-bun -t xcc-test:optimized .
docker run -p 5173:5173 --name test-opt -d xcc-test:optimized

# Test original build
docker build -f Dockerfile -t xcc-test:original .
docker run -p 5174:5173 --name test-orig -d xcc-test:original

# Compare sizes
docker images | grep xcc-test
```

### 3. Production Deployment
```bash
# Build production image
docker build -f Dockerfile-production -t xcc-prod .

# Run production container
docker run -p 3000:3000 --name xcc-production \
  -e NODE_ENV=production \
  --restart unless-stopped \
  -d xcc-prod
```

## Docker Compose (Optional)

Create a `docker-compose.yml` for easier management:

```yaml
version: '3.8'
services:
  xcc-dev:
    build:
      context: .
      dockerfile: Dockerfile-bun
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./static:/app/static
    environment:
      - NODE_ENV=development
    restart: unless-stopped
```

Then use:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs for errors
docker logs xcc-bun-container

# Check if port is already in use
lsof -i :5173

# Try different port
docker run -p 5174:5173 --name xcc-bun-container -d xcc-bun
```

#### 2. Cloudflare Adapter Issues (ARM64 Macs)
If you see `workerd ENOENT` errors:
- The optimized Dockerfile should handle this
- If issues persist, use the original Dockerfile
- Consider switching to production build with Node adapter

#### 3. Image Too Large
```bash
# Use the optimized Dockerfile-bun
docker build -f Dockerfile-bun -t xcc-bun .

# Check what's taking space
docker run --rm xcc-bun du -sh /app/* | sort -hr
```

#### 4. Build Failures
```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -f Dockerfile-bun -t xcc-bun .
```

### Performance Tips

1. **Use .dockerignore**: Ensure `.dockerignore` is properly configured
2. **Layer Caching**: Package files are copied before source code for better caching
3. **Multi-stage Builds**: Production builds use multi-stage for smaller images
4. **Alpine Linux**: Optimized builds use Alpine for smaller base image
5. **Package Exclusion**: Heavy packages like `@iconify/json` are excluded in optimized builds

## Size Comparison

| Dockerfile | Size | Reduction |
|------------|------|-----------|
| Original | 2.5GB | - |
| Dockerfile-bun | 756MB | 70% |
| Dockerfile-production | ~400MB | 84% |

## Health Checks

The containers include health checks. Monitor with:
```bash
# Check container health
docker ps

# View health check logs
docker inspect xcc-bun-container | grep Health -A 10
```

## Security Notes

- Production images run as non-root user
- Unnecessary files are excluded via `.dockerignore`
- Package manager caches are cleared to reduce attack surface
- Use specific image tags in production, not `latest`

---

For more information about the project, see [README.md](./README.md).