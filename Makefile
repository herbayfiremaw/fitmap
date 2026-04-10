.PHONY: dev down build up restart logs logs-server logs-client logs-db ps seed migrate clean

# Start all services in detached mode and follow logs
dev:
	docker compose up --build -d
	docker compose logs -f

# Start without rebuilding
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Rebuild and restart all services
build:
	docker compose up --build -d

# Restart all services
restart:
	docker compose restart

# Follow logs for all services
logs:
	docker compose logs -f

# Follow logs for individual services
logs-server:
	docker compose logs -f server

logs-client:
	docker compose logs -f client

logs-db:
	docker compose logs -f postgres

# Show running containers
ps:
	docker compose ps

# Run database seed
seed:
	docker compose exec server pnpm seed

# Run migrations
migrate:
	docker compose exec server pnpm migration:run

# Stop services and remove volumes (wipes DB data)
clean:
	docker compose down -v
