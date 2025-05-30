.PHONY: help docker-prod docker-local

# Docker configuration
DOCKER_IMAGE_NAME = mylosz/fap-log-viewer-email-receiver

# Include generic Docker commands
include ../../docker.mk

# Show help
help:
	@echo "Available commands:"
	@echo "  make docker-prod tag=TAG      - Build and push Docker image to remote registry"
	@echo "  make docker-local tag=TAG      - Build and push Docker image to local registry"
	@echo "  make help                     - Show this help message" 