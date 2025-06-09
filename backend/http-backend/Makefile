.PHONY: migration-generate migration-run migration-revert db-up db-down docker-prod docker-local docker-k3d

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
