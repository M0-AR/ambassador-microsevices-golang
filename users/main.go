package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"log"
	"users/src/database"
	"users/src/routes"
)

func main() {
	database.Connect()
	database.AutoMigrate()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true, // Allow the frontend to get Cookies from the backend
	}))

	routes.Setup(app)

	log.Fatal(app.Listen(":8000"))
}
