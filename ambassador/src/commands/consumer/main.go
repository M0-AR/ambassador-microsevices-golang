package main

import (
	"ambassador/src/database"
	"ambassador/src/events"
	"ambassador/src/models"
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"os"
)

func main() {
	database.Connect()
	database.SetupRedis()

	groupID := os.Getenv("KAFKA_GROUP_ID")
	if groupID == "" {
		groupID = "ambassador-consumer"
	}

	config := events.KafkaConsumerConfig(groupID)
	consumer, err := kafka.NewConsumer(&config)

	if err != nil {
		panic(err)
	}

	defer consumer.Close()

	consumer.SubscribeTopics([]string{"ambassador_topic"}, nil)

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

		//fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))

		if err := events.Listen(msg); err != nil {
			database.DB.Create(&models.KafkaError{
				Key:   msg.Key,
				Value: msg.Value,
				Error: err,
			})
		}
	}
}
