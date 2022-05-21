package main

import (
	"admin/src/database"
	"admin/src/events"
	"admin/src/models"
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func main() {
	database.Connect()

	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": "pkc-4ygn6.europe-west3.gcp.confluent.cloud:9092",
		"security.protocol": "SASL_SSL",
		"sasl.username":     "63UVCVFVTBPESSWN",
		"sasl.password":     "OxmD4lsSR8xT9CfQbjnLnaX3o1VX0W2qpyxP8YH8B/vPA4GlMHjgoV/bYTkx15Gx",
		"sasl.mechanism":    "PLAIN",
		"group.id":          "myGroup",
		"auto.offset.reset": "earliest",
	})

	if err != nil {
		panic(err)
	}

	consumer.SubscribeTopics([]string{"admin_topic"}, nil)

	fmt.Println("Started Consuming")

	for {
		msg, err := consumer.ReadMessage(-1)

		if err != nil {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v (%v)\n", err, msg)

			database.DB.Create(&models.KafkaError{
				Key:   msg.Key,
				Value: msg.Value,
				Error: err,
			})

			return
		}

		fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))

		if err := events.Listen(msg); err != nil {
			database.DB.Create(&models.KafkaError{
				Key:   msg.Key,
				Value: msg.Value,
				Error: err,
			})
		}
	}

	consumer.Close()
}
