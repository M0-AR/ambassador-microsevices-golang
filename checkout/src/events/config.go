package events

import (
	"os"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// KafkaConfig builds a client configuration from environment variables.
// Local development defaults to a PLAINTEXT broker on localhost:9092.
func KafkaConfig() kafka.ConfigMap {
	config := kafka.ConfigMap{
		"bootstrap.servers": envOr("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
	}

	if value := os.Getenv("KAFKA_SECURITY_PROTOCOL"); value != "" {
		config["security.protocol"] = value
	}
	if value := os.Getenv("KAFKA_SASL_MECHANISM"); value != "" {
		config["sasl.mechanism"] = value
	}
	if value := os.Getenv("KAFKA_SASL_USERNAME"); value != "" {
		config["sasl.username"] = value
	}
	if value := os.Getenv("KAFKA_SASL_PASSWORD"); value != "" {
		config["sasl.password"] = value
	}

	return config
}

func KafkaConsumerConfig(groupID string) kafka.ConfigMap {
	config := KafkaConfig()
	config["group.id"] = envOr("KAFKA_GROUP_ID", groupID)
	config["auto.offset.reset"] = envOr("KAFKA_AUTO_OFFSET_RESET", "earliest")
	return config
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
