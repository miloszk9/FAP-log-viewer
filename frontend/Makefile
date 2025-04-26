.PHONY: help

# Docker configuration
DOCKER_IMAGE_NAME = mylosz/fap-log-viewer-frontend

# Include generic Docker commands
include ../docker.mk

# Show help
help:
	@echo "Available commands:"
	@echo "  make docker-build             - Build Docker image"
	@echo "  make docker-push tag=TAG      - Push Docker image"
	@echo "  make docker-push-local tag=TAG - Push Docker image to local registry"
	@echo "  make help                     - Show this help message" 