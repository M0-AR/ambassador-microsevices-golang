package services

import (
	"fmt"
	"github.com/M0-AR/go-user-service"
	"os"
)

var UserService services.Service

func Setup() {
	UserService = services.CreateService(fmt.Sprintf("%s/api/", os.Getenv("USERS_MS")))
}
