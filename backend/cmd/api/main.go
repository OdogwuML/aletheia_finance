package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../../.env"); err != nil {
		log.Println("No .env file found or error loading it")
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "Aletheia Finance Backend LIVE",
			"version": "v0.1.0",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Aletheia Backend starting on port %s", port)
	r.Run(":" + port)
}
