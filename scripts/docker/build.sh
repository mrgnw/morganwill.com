#!/bin/bash
set -e

docker build -f Dockerfile-bun -t xcc-bun .
docker stop xcc-bun-container 2>/dev/null || true
docker rm xcc-bun-container 2>/dev/null || true
docker run -p 5173:5173 --name xcc-bun-container -d xcc-bun

echo "http://localhost:5173"
