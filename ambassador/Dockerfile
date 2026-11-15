FROM golang:1.24-bookworm

WORKDIR /app

RUN go install github.com/air-verse/air@v1.61.7
ENV PATH="/root/go/bin:${PATH}"

COPY go.mod go.sum ./
RUN go mod download
COPY . .

EXPOSE 8000
CMD ["air"]
