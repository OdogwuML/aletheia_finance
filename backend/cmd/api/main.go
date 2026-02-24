package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aletheia-finance/core/backend/internal/api"
	"github.com/aletheia-finance/core/backend/internal/og"
	"github.com/aletheia-finance/core/backend/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// ... (Load env as before)
	if err := godotenv.Load("../../../.env"); err != nil {
		log.Println("No .env file found or error loading it")
	}

	evmRpc := os.Getenv("OG_RPC_URL")
	indRpc := os.Getenv("OG_STORAGE_ENDPOINT")
	privateKey := os.Getenv("AGENT_PRIVATE_KEY")

	ogClient, err := og.NewOGClient(evmRpc, indRpc, privateKey)
	if err != nil {
		log.Fatalf("Critical Failure: Could not initialize 0G Client: %v", err)
	}
	defer ogClient.Close()

	// Service Initialization
	supabaseService := services.NewSupabaseService()
	creditService := services.NewCreditService(supabaseService)
	compilerService := services.NewCompilerService()
	watcherService := services.NewWatcherService()
	servingService := services.NewServingService(os.Getenv("OG_SERVING_ENDPOINT"), os.Getenv("OG_SERVING_KEY"))
	vaultService, err := services.NewVaultService(evmRpc, privateKey, os.Getenv("VAULT_ADDRESS"))
	if err != nil {
		log.Printf("Warning: VaultService unavailable (on-chain settlement disabled): %v", err)
		vaultService = nil
	}

	// Handler Initialization
	h := api.NewHandler(ogClient, creditService, compilerService, supabaseService, watcherService, servingService, vaultService)

	r := gin.Default()

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://aletheia-finance.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
		v1.GET("/user/stats", h.GetUserStats)
		v1.GET("/user/strategies", h.GetUserStrategies)
		v1.GET("/watcher/alerts", h.GetWatcherAlerts)
		v1.POST("/watcher/execute", h.ExecuteSimulatedTrade)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Aletheia Backend starting on port %s", port)
	r.Run(":" + port)
}
