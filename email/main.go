package main

import (
	"encoding/json"
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"net/smtp"
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

	consumer.SubscribeTopics([]string{"default"}, nil)

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

		var message map[string]interface{}

		json.Unmarshal(msg.Value, &message)

		ambassadorMessage := []byte(fmt.Sprintf("You earned $%f from the link #%s", message["ambassador_revenue"].(float64), message["code"]))
		smtp.SendMail("172.17.0.1:1025", nil, "no-reply@email.com", []string{message["ambassador_email"].(string)}, ambassadorMessage) // TODO: instead of 172.17.0.1 could be host.docker.internal

		adminMessage := []byte(fmt.Sprintf("Order #%d with a total of $%f has been completed", message["id"].(float64), message["admin_revenue"].(float64))) // TODO: instead of 172.17.0.1 could be host.docker.internal
		smtp.SendMail("172.17.0.1:1025", nil, "no-reply@email.com", []string{"admin@admin.com"}, adminMessage)
	}

	consumer.Close()
}
