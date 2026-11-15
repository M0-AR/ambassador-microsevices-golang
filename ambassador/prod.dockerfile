FROM golang:1.27-bookworm AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/service . \
    && CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/consumer ./src/commands/consumer \
    && CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/consumer ./src/commands/consumer

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /out/ /app/

USER 65532:65532
EXPOSE 8000
CMD ["/app/service"]
