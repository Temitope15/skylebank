#!/usr/bin/env bash

# Set strict mode
set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "      SkyleBank Backend Manager           "
echo "=========================================="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed or not in PATH." >&2
    exit 1
fi

# Determine profile from first argument or prompt
PROFILE=""
if [ $# -ge 1 ]; then
    case "$1" in
        dev|prod)
            PROFILE="$1"
            ;;
        *)
            echo "Invalid profile argument: '$1'. Valid options: dev, prod"
            exit 1
            ;;
    esac
fi

if [ -z "$PROFILE" ]; then
    echo "Choose active Spring profile:"
    echo "  1) dev  (Development - Default)"
    echo "  2) prod (Production)"
    read -rp "Select option [1-2] (default: 1): " choice
    case "$choice" in
        2)
            PROFILE="prod"
            ;;
        *)
            PROFILE="dev"
            ;;
    esac
fi

echo "Selected Profile: $PROFILE"

# Start docker-compose infrastructure
echo "Starting local docker-compose infrastructure (Postgres, Redis, MailHog)..."
docker compose up -d

# Verify infrastructure is running
echo "Verifying service health..."
docker compose ps

# Make sure .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    else
        echo "Error: .env or .env.example not found in root directory!" >&2
        exit 1
    fi
fi

# Ensure port 8080 is free to prevent startup collisions
echo "Checking if port 8080 is occupied..."
# Stop any running docker containers running maven/java on host network
RUNNING_CONTAINERS=$(docker ps -q || true)
if [ -n "$RUNNING_CONTAINERS" ]; then
    for CONTAINER in $RUNNING_CONTAINERS; do
        if docker top "$CONTAINER" 2>/dev/null | grep -E "mvn|java|spring-boot" > /dev/null; then
            CONTAINER_NAME=$(docker ps --filter "id=$CONTAINER" --format "{{.Names}}")
            echo "Stopping conflicting container: $CONTAINER_NAME ($CONTAINER)..."
            docker stop "$CONTAINER" &>/dev/null || true
        fi
    done
fi

# Clean up any remaining native processes on port 8080
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -t -i :8080 || true)
    if [ -n "$PIDS" ]; then
        echo "Force killing remaining process(es) on port 8080: $PIDS"
        kill -9 $PIDS || true
    fi
fi

# Run the backend using the maven Docker container (Java 21)
echo "Booting the Spring Boot application under '$PROFILE' profile..."
docker run --env-file .env -it --rm --network="host" \
  -v "$SCRIPT_DIR/skylebank-backend:/app" \
  -v "$HOME/.m2/repository:/root/.m2/repository" \
  -w /app \
  maven:3.9.6-eclipse-temurin-21-alpine \
  mvn spring-boot:run -Dspring-boot.run.profiles="$PROFILE"
