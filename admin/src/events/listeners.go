package events

import (
	"admin/src/database"
	"admin/src/models"
	"encoding/json"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func Listen(message *kafka.Message) {
	key := string(message.Key)

	switch key {
	case "link_created":
		LinkCreated(message.Value)
	}
}

func LinkCreated(value []byte) {
	var link models.Link

	json.Unmarshal(value, &link)

	database.DB.Create(&link)
}
