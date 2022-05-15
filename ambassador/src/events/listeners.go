package events

import (
	"ambassador/src/database"
	"ambassador/src/models"
	"encoding/json"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func Listen(message *kafka.Message) {
	key := string(message.Key)

	switch key {
	case "product_created":
		ProductCreated(message.Value)
	case "product_updated":
		ProductUpdated(message.Value)
	case "product_deleted":
		ProductDeleted(message.Value)
	}
}

func ProductCreated(value []byte) {
	var product models.Product

	json.Unmarshal(value, &product)

	database.DB.Create(&product)

	go database.ClearCache("products_frontend", "products_backend")
}

func ProductUpdated(value []byte) {
	var product models.Product

	json.Unmarshal(value, &product)

	database.DB.Model(&product).Updates(&product)

	go database.ClearCache("products_frontend", "products_backend")
}

func ProductDeleted(value []byte) {
	var id uint

	json.Unmarshal(value, &id)

	database.DB.Delete(&models.Product{}, "id = ?", id)

	go database.ClearCache("products_frontend", "products_backend")
}
