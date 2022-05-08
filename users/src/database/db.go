package database

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"users/src/models"
)

var DB *gorm.DB

func Connect() {
	var err error

	DB, err = gorm.Open(mysql.Open("root:root@tcp(users_db:3306)/users"), &gorm.Config{})

	if err != nil {
		panic("Could not connect with the database!")
	}
}

func AutoMigrate() {
	DB.AutoMigrate(models.User{})
}
