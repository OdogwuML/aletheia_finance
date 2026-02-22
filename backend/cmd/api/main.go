package main

import (
	"log"
	"net/http"
	"os"

	"github.com/aletheia-finance/core/internal/api"
	"github.com/aletheia-finance/core/internal/og"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../../.env"); err != nil {
		log.Println("No .env file found or error loading it")
	}

	// 0G Client Initialization
	evmRpc := os.Getenv("OG_RPC_URL")
	indRpc := os.Getenv("OG_STORAGE_ENDPOINT")
	privateKey := os.Getenv("AGENT_PRIVATE_KEY")

	ogClient, err := og.NewOGClient(evmRpc, indRpc, privateKey)
	if err != nil {
		log.Fatalf("Critical Failure: Could not initialize 0G Client: %v", err)
	}
	defer ogClient.Close()

	// Handler Initialization
	h := api.NewHandler(ogClient)

	r := gin.Default()

	// API Routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "Aletheia Finance Backend LIVE",
				"version": "v0.1.0",
			})
		})

		v1.POST("/strategies", h.CreateStrategy)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Aletheia Backend starting on port %s", port)
	r.Run(":" + port)
}
