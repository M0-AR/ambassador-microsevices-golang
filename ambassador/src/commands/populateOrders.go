package main

import (
	"ambassador/src/database"
	"ambassador/src/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Order struct {
	Id         uint        `json:"id"`
	UserId     uint        `json:"user_id"` // AmbassadorId
	Code       string      `json:"code"`
	OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderId"`
}

type OrderItem struct {
	Id                uint    `json:"id"`
	OrderId           uint    `json:"order_id"`
	AmbassadorRevenue float64 `json:"ambassador_revenue"` // Ambassador will take 10% of purchase
}

func main() {
	database.Connect()

	db, err := gorm.Open(mysql.Open("root:root@tcp(172.17.0.1:33066)/ambassador"), &gorm.Config{}) // TODO: instead of 172.17.0.1 could be host.docker.internal

	if err != nil {
		panic(err)
	}

	var orders []Order

	db.Preload("OrderItems").Find(&orders)

	for _, order := range orders {
		var total = 0.0

		for _, orderItem := range order.OrderItems {
			total += orderItem.AmbassadorRevenue
		}

		database.DB.Create(&models.Order{
			Id:     order.Id,
			UserId: order.UserId,
			Code:   order.Code,
			Total:  total,
		})
	}
}
