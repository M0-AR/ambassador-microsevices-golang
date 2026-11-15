# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-15

### Added

- A complete interactive product experience at `docs/preview.html`: dashboard, products, ambassadors, links, storefront, orders, analytics, payouts, and settings.
- An accessible tab bar that lazy-loads each real demo screen inside a browser frame, with posters, full-screen links, and keyboard navigation.
- A 3D neural-growth learning game with narrated affiliate-marketing concepts.
- A zero-to-hero academy quiz with explanations and a downloadable certificate.
- A live ROI calculator and an interactive event-flow architecture diagram.
- A rich README with a plain-language beginner guide, business overview, architecture, API summary, and honest limitations.
- An OpenAPI contract for the public HTTP surface and release notes for v1.0.0.
- GitHub Actions for CI, releases, CodeQL, and GHCR image publishing with SBOM and provenance.
- Issue templates, a pull-request template, Dependabot configuration, and repository health files.
- Multi-stage, non-root production images for all five services.

### Changed

- Reorganised Go command packages so `go build ./...` succeeds for every service.
- Dockerfiles now use Go 1.24, install a pinned live-reload tool, and copy the full service context.
- Kubernetes manifests and compose files read credentials from environment variables or Secrets.
- The production compose files use the same image for API and consumer processes, overriding only the command.
- API processes read `PORT` (default `8000`) so all four can run side by side on one host.
- The ambassador service reads `REDIS_ADDR` instead of a hard-coded container hostname.
- Consumer processes read `KAFKA_GROUP_ID`, matching the values already set in Compose.
- Production images for admin, ambassador, and checkout now include the consumer binary used by Compose.

### Fixed

- Removed hard-coded Kafka, Stripe, SMTP, and database credentials from the current tree.
- Fixed the `update-rankings` score assignment.
- Fixed the `STRIP_KEY` typo in the checkout Kubernetes manifest.
- Made the `populate-*` commands read their source database DSN from `SOURCE_DB_DSN`.
- Made the JWT signing key configurable through `JWT_SECRET` instead of a fixed constant.
- Cleared `go vet` findings in the email consumer and the admin, ambassador, and checkout consumer commands.

### Security

- Credentials that appeared in earlier commits must be rotated. See [SECURITY.md](SECURITY.md).
- Added a production hardening checklist and private vulnerability reporting guidance.

[Unreleased]: https://github.com/M0-AR/ambassador-microsevices-golang/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/M0-AR/ambassador-microsevices-golang/releases/tag/v1.0.0
