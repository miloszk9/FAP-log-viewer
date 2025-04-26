# Generic Docker commands
.PHONY: docker-build docker-push docker-push-local

# Docker configuration
DOCKER_IMAGE_NAME ?= $(error DOCKER_IMAGE_NAME must be set)
DOCKER_REGISTRY_LOCAL ?= localhost:5000
DOCKER_DEFAULT_TAG ?= latest

# Build Docker image
# Usage: make docker-build
docker-build:
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_DEFAULT_TAG) .

# Push Docker image
# Usage: make docker-push tag=TAG
docker-push:
	@if [ -z "$(tag)" ]; then \
		echo "Error: Tag is required. Usage: make docker-push tag=TAG"; \
		exit 1; \
	fi
	docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_DEFAULT_TAG) $(DOCKER_IMAGE_NAME):$(tag)
	docker push $(DOCKER_IMAGE_NAME):$(tag)

# Push Docker image to local registry
# Usage: make docker-push-local tag=TAG
docker-push-local:
	@if [ -z "$(tag)" ]; then \
		echo "Error: Tag is required. Usage: make docker-push-local tag=TAG"; \
		exit 1; \
	fi
	docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_DEFAULT_TAG) $(DOCKER_REGISTRY_LOCAL)/$(DOCKER_IMAGE_NAME):$(tag)
	docker push $(DOCKER_REGISTRY_LOCAL)/$(DOCKER_IMAGE_NAME):$(tag) 