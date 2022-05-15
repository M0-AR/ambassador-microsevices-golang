package main

import (
	"admin/src/database"
	"admin/src/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	database.Connect()

	db, err := gorm.Open(mysql.Open("root:root@tcp(172.17.0.1:33066)/ambassador"), &gorm.Config{}) // TODO: instead of 172.17.0.1 could be host.docker.internal

	if err != nil {
		panic(err)
	}

	var links []models.Link

	db.Preload("Products").Find(&links)

	for _, link := range links {
		database.DB.Create(&link)
	}
}
