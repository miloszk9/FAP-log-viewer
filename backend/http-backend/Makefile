.PHONY: migration-generate migration-run migration-revert db-up db-down docker-prod docker-local

# Docker configuration
DOCKER_IMAGE_NAME = mylosz/fap-log-viewer-backend

# Include generic Docker commands
include ../../docker.mk

# Start the database container
db-up:
	docker-compose -f docker-compose-migrations.yml up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker-compose -f docker-compose-migrations.yml exec -T postgres pg_isready -U ${DB_USERNAME:-postgres} -d ${DB_NAME:-fap_analysis}; do \
		echo "Waiting for PostgreSQL to be ready..."; \
		sleep 2; \
	done

# Stop the database container
db-down:
	docker-compose -f docker-compose-migrations.yml down -v

# Generate a new migration
# Usage: make migration-generate name=MigrationName
migration-generate: db-up
	@if [ -z "$(name)" ]; then \
		echo "Error: Migration name is required. Usage: make migration-generate name=MigrationName"; \
		exit 1; \
	fi
	npm run migration:run
	npm run migration:generate src/database/migrations/sql/$(name)
	@make db-down

# Run all pending migrations
migration-run: db-up
	npm run migration:run
	@make db-down

# Revert the last migration
migration-revert: db-up
	npm run migration:revert
	@make db-down

# Create a new empty migration
# Usage: make migration-create name=MigrationName
migration-create: db-up
	@if [ -z "$(name)" ]; then \
		echo "Error: Migration name is required. Usage: make migration-create name=MigrationName"; \
		exit 1; \
	fi
	npm run migration:create src/database/migrations/sql/$(name)
	@make db-down

# Show help
help:
	@echo "Available commands:"
	@echo "  make db-up                    - Start the database container"
	@echo "  make db-down                  - Stop the database container"
	@echo "  make migration-generate name=NAME  - Generate a new migration"
	@echo "  make migration-run            - Run all pending migrations"
	@echo "  make migration-revert         - Revert the last migration"
	@echo "  make migration-create name=NAME   - Create a new empty migration"
	@echo "  make docker-prod tag=TAG      - Build and push Docker image to remote registry"
	@echo "  make docker-local tag=TAG      - Build and push Docker image to local registry"
	@echo "  make help                     - Show this help message" 