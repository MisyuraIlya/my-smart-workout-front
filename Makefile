SHELL := /usr/bin/env bash

ENV_FILE ?= .env.production
IMAGE ?= workout-front:latest
REQUIRED_VARS := NEXT_PUBLIC_WORKOUT_API_URL NEXT_PUBLIC_AUTH_API_URL NEXT_PUBLIC_STORAGE_URL

.PHONY: help check-env build-prod docker-build-prod

help:
	@echo "Targets:"
	@echo "  make build-prod [ENV_FILE=.env.production]"
	@echo "  make docker-build-prod [ENV_FILE=.env.production] [IMAGE=workout-front:latest]"

check-env:
	@test -f "$(ENV_FILE)" || { \
		echo "Missing $(ENV_FILE)"; \
		echo "Create it from .env.production.example and set production values."; \
		exit 1; \
	}
	@set -a; source "$(ENV_FILE)"; set +a; \
	for var_name in $(REQUIRED_VARS); do \
		if [[ -z "$${!var_name:-}" ]]; then \
			echo "Missing required variable: $$var_name in $(ENV_FILE)"; \
			exit 1; \
		fi; \
	done

build-prod: check-env
	@set -a; source "$(ENV_FILE)"; set +a; \
	NODE_ENV=production npx next build

docker-build-prod: check-env
	@set -a; source "$(ENV_FILE)"; set +a; \
	docker build \
		--build-arg NEXT_PUBLIC_WORKOUT_API_URL="$$NEXT_PUBLIC_WORKOUT_API_URL" \
		--build-arg NEXT_PUBLIC_AUTH_API_URL="$$NEXT_PUBLIC_AUTH_API_URL" \
		--build-arg NEXT_PUBLIC_STORAGE_URL="$$NEXT_PUBLIC_STORAGE_URL" \
		-t "$(IMAGE)" .
