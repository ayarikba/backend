# Makefile for Docker-compose project

# Define the Docker-compose file
DOCKER_COMPOSE_FILE := docker-compose.yml

# Define the service name (change it to your service name)
SERVICE_NAME := my-service

.PHONY: all
all: build

.PHONY: build
build:
	sudo docker-compose -f $(DOCKER_COMPOSE_FILE) build

.PHONY: rebuild
rebuild: clean build

.PHONY: clean
clean:
	sudo docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --remove-orphans

.PHONY: run
run:
	sudo docker-compose -f $(DOCKER_COMPOSE_FILE) up 

.PHONY: stop
stop:
	sudo docker-compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: logs
logs:
	sudo docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: restart
restart: stop run

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  - build:        Build the Docker-compose project"
	@echo "  - rebuild:      Clean and rebuild the Docker-compose project"
	@echo "  - clean:        Remove containers, networks, and volumes"
	@echo "  - run:          Start the Docker-compose project in detached mode"
	@echo "  - stop:         Stop the Docker-compose project"
	@echo "  - logs:         View and follow container logs"
	@echo "  - restart:      Restart the Docker-compose project"
	@echo "  - help:         Display this help message"

# Default target when Make is executed without arguments
.DEFAULT_GOAL := help
