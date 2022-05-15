package main

import (
	"admin/src/database"
	//"admin/src/routes"
	//"admin/src/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	database.Connect()
	database.AutoMigrate()
	//services.Setup()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true, // Allow the frontend to get Cookies from the backend
	}))

	//routes.Setup(app)

	app.Listen(":8000")
}
