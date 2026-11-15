# Contributing to Ambassador

Thank you for taking the time to contribute. This project is built to be read, run, and improved by people with different levels of experience.

## Ways to contribute

- Report a bug with a minimal reproduction.
- Improve documentation, diagrams, or the interactive demo.
- Add a test, a health check, or a deployment example.
- Propose a feature through an issue before opening a large pull request.

## Development setup

1. Install Go 1.24 or newer, Docker, and Docker Compose.
2. Clone the repository and create a branch.

```bash
git clone https://github.com/M0-AR/ambassador-microsevices-golang.git
cd ambassador-microsevices-golang
git switch -c feat/your-change
```

3. Configure local values.

```bash
cp .env.example .env
# Edit .env. Never commit it.
```

4. Build and verify every service.

```bash
make build
make vet
make test
```

5. Preview the static product demo.

```bash
make demo
# Open http://localhost:8080/preview.html
```

## Pull request checklist

- [ ] The change has one clear purpose.
- [ ] `make build`, `make vet`, and `make test` pass.
- [ ] New behaviour is documented in the README or `docs/`.
- [ ] No credentials, tokens, customer data, or `.env` files are included.
- [ ] Screenshots or a short recording are attached for UI changes.
- [ ] The interactive demo still works with keyboard navigation.

## Commit messages

Use short, imperative subjects. Conventional prefixes are welcome:

```text
feat: add payout approval flow to demo
fix: read Kafka credentials from environment
docs: explain the event topics
```

## Security

Do not open a public issue for a vulnerability. Follow [SECURITY.md](SECURITY.md).

## Code of conduct

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
