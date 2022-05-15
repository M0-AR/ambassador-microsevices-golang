package events

import (
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func main() {
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

	consumer.SubscribeTopics([]string{"ambassador_topic"}, nil)

	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
		} else {
			// The client will automatically try to recover from all errors.
			fmt.Printf("Consumer error: %v (%v)\n", err, msg)
			return
		}

		fmt.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))

		Listen(msg)
	}

	consumer.Close()
}
