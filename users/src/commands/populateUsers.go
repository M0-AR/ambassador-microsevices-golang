package main

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"users/src/database"
	"users/src/models"
)

func main() {
	database.Connect()

	db, err := gorm.Open(mysql.Open("root:root@tcp(172.17.0.1:33066)/ambassador"), &gorm.Config{}) // TODO: instead of 172.17.0.1 could be host.docker.internal

	if err != nil {
		panic(err)
	}

	var users []models.User

	db.Find(&users)

	for _, user := range users {
		database.DB.Create(&user)
	}
}
