package events

import (
	"encoding/json"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

var Producer *kafka.Producer

func SetupProducer() {
	var err error

	Producer, err = kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": "pkc-4ygn6.europe-west3.gcp.confluent.cloud:9092",
		"security.protocol": "SASL_SSL",
		"sasl.username":     "63UVCVFVTBPESSWN",
		"sasl.password":     "OxmD4lsSR8xT9CfQbjnLnaX3o1VX0W2qpyxP8YH8B/vPA4GlMHjgoV/bYTkx15Gx",
		"sasl.mechanism":    "PLAIN",
	})

	if err != nil {
		panic(err)
	}

	//defer Producer.Close()
}

func Produce(topic, key string, message interface{}) {
	value, _ := json.Marshal(message)

	Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Key:            []byte(key),
		Value:          value,
	}, nil)

	// Wait for message deliveries before shutting down
	Producer.Flush(15 * 1000)
}
