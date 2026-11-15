package database

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"os"
	"time"
)

var Cache *redis.Client
var CacheChannel chan string

func SetupRedis() {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "redis:6379"
	}

	Cache = redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   0,
	})
}

func SetupCacheChannel() { // Waiting for an event.
	CacheChannel = make(chan string)

	go func(ch chan string) {
		for {
			time.Sleep(5 * time.Second)

			key := <-ch

			Cache.Del(context.Background(), key)

			fmt.Println("Cache cleared" + key)
		}
	}(CacheChannel)
}

func ClearCache(keys ...string) { // Sending an event.
	for _, key := range keys {
		CacheChannel <- key
	}
}
