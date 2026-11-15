package events

import (
	"encoding/json"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

var Producer *kafka.Producer

func SetupProducer() {
	var err error

	config := KafkaConfig()
	Producer, err = kafka.NewProducer(&config)

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
