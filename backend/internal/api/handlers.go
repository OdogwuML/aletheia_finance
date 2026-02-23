package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/aletheia-finance/core/backend/internal/models"
	"github.com/aletheia-finance/core/backend/internal/og"
	"github.com/aletheia-finance/core/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	OG       *og.OGClient
	Credit   *services.CreditService
	Compiler *services.CompilerService
	Supabase *services.SupabaseService
}

func NewHandler(ogClient *og.OGClient, creditService *services.CreditService, compilerService *services.CompilerService, supabaseService *services.SupabaseService) *Handler {
	return &Handler{
		OG:       ogClient,
		Credit:   creditService,
		Compiler: compilerService,
		Supabase: supabaseService,
	}
}

func (h *Handler) CreateStrategy(c *gin.Context) {
	var req models.CreateStrategyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Credit Check & Deduction (Atomic-ish)
	// We'll provision a sample account if one doesn't exist for test purposes
	h.Credit.ProvisionAccount(req.OwnerAddress)

	const cost = 50
	err := h.Credit.Deduct(req.OwnerAddress, cost, "Strategy Creation: "+req.LogicNLP)
	if err != nil {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":   "Insufficient Credits",
			"details": err.Error(),
		})
		return
	}

	// 2. Compile NLP to Structured Logic
	compiled, err := h.Compiler.Compile(req.LogicNLP)
	if err != nil {
		h.Credit.Refund(req.OwnerAddress, cost, "Rollback: Compilation Failure")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Strategy Compilation Failed",
			"details": err.Error(),
		})
		return
	}

	// 3. Create the Rulebook object
	rulebook := models.StrategyRulebook{
		StrategyID:        uuid.New().String(),
		OwnerAddress:      req.OwnerAddress,
		LogicNLP:          req.LogicNLP,
		RuleEngineVersion: "v0.1.0",
		CompiledLogic:     compiled,
		Status:            models.StatusActive,
		CreatedAt:         time.Now(),
	}

	// 3. Serialize for 0G Storage
	data, err := json.Marshal(rulebook)
	if err != nil {
		h.Credit.Refund(req.OwnerAddress, cost, "Rollback: Serialization Failure")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to serialize rulebook"})
		return
	}

	// 4. Upload to 0G Storage
	txHash, err := h.OG.UploadRulebook(c.Request.Context(), data)
	if err != nil {
		h.Credit.Refund(req.OwnerAddress, cost, "Rollback: 0G Upload Failure")
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "0G Storage Upload Failed",
			"details": err.Error(),
		})
		return
	}

	rulebook.DeploymentTx = txHash

	// 5. Record in Supabase
	_, err = h.Supabase.post("strategies", map[string]interface{}{
		"strategy_id":         rulebook.StrategyID,
		"owner_address":       rulebook.OwnerAddress,
		"logic_nlp":           rulebook.LogicNLP,
		"rule_engine_version": rulebook.RuleEngineVersion,
		"compiled_logic":      rulebook.CompiledLogic,
		"deployment_tx":       rulebook.DeploymentTx,
		"status":              string(rulebook.Status),
	})
	if err != nil {
		// Log error but don't fail the request as 0G upload succeeded
		fmt.Printf("Warning: Failed to log strategy to Supabase: %v\n", err)
	}

	// 6. Return success
	c.JSON(http.StatusCreated, gin.H{
		"message":      "Strategy secured on 0G Network",
		"strategy_id":  rulebook.StrategyID,
		"0g_tx_hash":   txHash,
		"credits_paid": cost,
		"rulebook_url": "https://storagescan-galileo.0g.ai/tx/" + txHash,
	})
}
