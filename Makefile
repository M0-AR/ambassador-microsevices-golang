SERVICES := users admin ambassador checkout email
SHELL := /bin/bash

.PHONY: help build vet test fmt demo docs screenshots release clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"; printf "Ambassador\n\n"} /^[a-zA-Z_-]+:.*##/ {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build every Go service
	@set -e; for service in $(SERVICES); do \
		echo "==> building $$service"; \
		(cd $$service && go build ./...); \
	done

vet: ## Run go vet for every service
	@set -e; for service in $(SERVICES); do \
		echo "==> vetting $$service"; \
		(cd $$service && go vet ./...); \
	done

test: ## Run tests for every service
	@set -e; for service in $(SERVICES); do \
		echo "==> testing $$service"; \
		(cd $$service && go test ./...); \
	done

fmt: ## Format every Go file
	@set -e; for service in $(SERVICES); do \
		(cd $$service && gofmt -w .); \
	done

demo: ## Serve the interactive demo at http://localhost:8080/preview.html
	@python3 -m http.server 8080 --directory docs

docs: ## Open the demo landing page from the repository root
	@python3 -m http.server 8080

screenshots: ## Capture demo screenshots and the README GIF
	@node scripts/capture-demo.mjs

release: ## Build release assets into dist/
	@set -e; \
	mkdir -p dist; \
	zip -qr dist/ambassador-docs-$${VERSION:-v1.0.0}.zip docs preview.html README.md LICENSE CHANGELOG.md; \
	cp docs/openapi.yaml dist/openapi.yaml; \
	(cd dist && sha256sum ./*.zip openapi.yaml > SHA256SUMS.txt); \
	ls -lh dist

clean: ## Remove local build output and generated demo artifacts
	@rm -rf /tmp/ambassador-* dist
