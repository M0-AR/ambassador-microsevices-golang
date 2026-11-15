# Kubernetes deployment notes

The manifests in this folder are reference deployment examples. They expect:

1. A reachable MySQL server (or one StatefulSet per service) and databases named `users`, `admin`, `ambassador`, and `checkout`.
2. A Kafka-compatible broker. Set the broker and credentials in `kafka-secrets`.
3. Redis reachable at `redis:6379` for the ambassador service.
4. An Ingress controller that supports `networking.k8s.io/v1`.
5. Container images built from each service's `prod.dockerfile` or pulled from GHCR.

## Apply order

```bash
kubectl apply -f kubernetes/config.example.yaml
kubectl apply -f kubernetes/secrets.example.yaml   # replace placeholders first
kubectl apply -f kubernetes/users.yaml
kubectl apply -f kubernetes/redis.yaml
kubectl apply -f kubernetes/admin.yaml
kubectl apply -f kubernetes/ambassador.yaml
kubectl apply -f kubernetes/checkout.yaml
kubectl apply -f kubernetes/email.yaml
kubectl apply -f kubernetes/ingress.yaml
```

Never commit a filled-in `secrets.yaml`. The example file contains placeholders only.
