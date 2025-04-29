# Generic Docker commands
.PHONY: docker-build docker-push docker-push-local

# Docker configuration
DOCKER_IMAGE_NAME ?= $(error DOCKER_IMAGE_NAME must be set)
DOCKER_REGISTRY_LOCAL ?= localhost:5000

# Build and push Docker image to remote registry
# Usage: make docker-push tag=TAG
docker-prod:
	@if [ -z "$(tag)" ]; then \
		echo "Error: Tag is required. Usage: make docker-push tag=TAG"; \
		exit 1; \
	fi
	docker buildx build --platform linux/amd64,linux/arm64 -t $(DOCKER_IMAGE_NAME):$(tag) --push .

# Build and push Docker image to local registry
# Usage: make docker-push-local tag=TAG
docker-local:
	@if [ -z "$(tag)" ]; then \
		echo "Error: Tag is required. Usage: make docker-push-local tag=TAG"; \
		exit 1; \
	fi
	docker build -t $(DOCKER_IMAGE_NAME):$(tag) .
	docker push $(DOCKER_REGISTRY_LOCAL)/$(DOCKER_IMAGE_NAME):$(tag) 