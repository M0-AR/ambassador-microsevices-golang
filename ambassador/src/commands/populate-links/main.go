package main

import (
	"ambassador/src/database"
	"ambassador/src/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	database.Connect()

	db, err := gorm.Open(mysql.Open(database.SourceDSN()), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	var links []models.Link

	db.Preload("Products").Find(&links)

	for _, link := range links {
		database.DB.Create(&link)
	}
}
