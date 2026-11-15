# Security policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the affected service, a reproduction, and the impact you believe is possible.

You can expect an acknowledgement within 72 hours. Please allow time for a fix before public disclosure.

## Secrets policy

- Credentials are read from environment variables or Kubernetes Secrets.
- Set `JWT_SECRET` to a long random value; the development fallback is intentionally insecure.
- `.env` files, database volumes, and private keys are ignored by Git.
- Never commit a live Stripe key, Kafka credential, SMTP password, or database password.
- Rotate any credential immediately if it is exposed, even if the commit is later removed. Git history is not a safe place for secrets.

If you are running an older copy of this repository, review your Kafka, Stripe, SMTP, and database credentials and rotate anything that may have been committed. The current tree contains placeholders only.

## Production checklist

- [ ] Rotate every credential that existed before your fork or deployment.
- [ ] Use a secret manager or Kubernetes Secrets, not compose literals.
- [ ] Set a strong `JWT_SECRET` and keep it out of logs and images.
- [ ] Put the services behind TLS and a trusted ingress.
- [ ] Restrict CORS to your real frontend origins.
- [ ] Use least-privilege database users, not `root`.
- [ ] Enable Stripe webhook signature verification for payment confirmations.
- [ ] Add rate limiting and request size limits at the edge.
- [ ] Back up each service database and test restores.
- [ ] Monitor Kafka consumer lag and failed-message tables.
