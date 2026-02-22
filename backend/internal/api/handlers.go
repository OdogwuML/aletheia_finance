package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/aletheia-finance/core/internal/models"
	"github.com/aletheia-finance/core/internal/og"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	OG *og.OGClient
}

func NewHandler(ogClient *og.OGClient) *Handler {
	return &Handler{OG: ogClient}
}

func (h *Handler) CreateStrategy(c *gin.Context) {
	var req models.CreateStrategyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Create the Rulebook object
	// Note: In Layer 2, we would have an AI model compile the LogicNLP.
	// For SOP 1, we focus on the "Upload" flow with a placeholder compiled rule.
	rulebook := models.StrategyRulebook{
		StrategyID:        uuid.New().String(),
		OwnerAddress:      req.OwnerAddress,
		LogicNLP:          req.LogicNLP,
		RuleEngineVersion: "v0.1.0",
		CompiledLogic:     "{\"rules\": \"placeholder\"}", // This will be real logic later
		Status:            models.StatusActive,
		CreatedAt:         time.Now(),
	}

	// 2. Serialize for 0G Storage
	data, err := json.Marshal(rulebook)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to serialize rulebook"})
		return
	}

	// 3. Upload to 0G Storage
	txHash, err := h.OG.UploadRulebook(c.Request.Context(), data)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "0G Storage Upload Failed",
			"details": err.Error(),
		})
		return
	}

	rulebook.DeploymentTx = txHash

	// 4. Return success with the TradeReceipt (conceptual)
	c.JSON(http.StatusCreated, gin.H{
		"message":      "Strategy secured on 0G Network",
		"strategy_id":  rulebook.StrategyID,
		"0g_tx_hash":   txHash,
		"rulebook_url": "https://storagescan-galileo.0g.ai/tx/" + txHash,
	})
}
