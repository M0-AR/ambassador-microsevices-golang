package main

import (
	"checkout/src/database"
	"checkout/src/events"
	"checkout/src/routes"
	"checkout/src/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"os"
)

func main() {
	database.Connect()
	database.AutoMigrate()
	services.Setup()
	events.SetupProducer()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true, // Allow the frontend to get Cookies from the backend
	}))

	routes.Setup(app)

	app.Listen(":" + port())
}

func port() string {
	if value := os.Getenv("PORT"); value != "" {
		return value
	}

	return "8000"
}
