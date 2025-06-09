# Generic Docker commands
.PHONY: docker-build docker-push docker-push-local docker-k3d

# Docker configuration
DOCKER_IMAGE_NAME ?= $(error DOCKER_IMAGE_NAME must be set)

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

# Build local image and import to k3d cluster
# Usage: make docker-k3d tag=TAG
docker-k3d: docker-local
	@if [ -z "$(tag)" ]; then \
		echo "Error: Tag is required. Usage: make docker-k3d tag=TAG"; \
		exit 1; \
	fi
	docker exec k3d-fap-server-0 sh -c "ctr image rm \$$(ctr image list -q | grep $(DOCKER_IMAGE_NAME) | head -1)" || true
	k3d image import $(DOCKER_IMAGE_NAME):$(tag) -c fap
