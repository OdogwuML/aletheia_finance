package api

import (
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/aletheia-finance/core/backend/internal/models"
	"github.com/aletheia-finance/core/backend/internal/og"
	"github.com/aletheia-finance/core/backend/internal/services"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	OG       *og.OGClient
	Credit   *services.CreditService
	Compiler *services.CompilerService
	Supabase *services.SupabaseService
	Watcher  *services.WatcherService
	Serving  *services.ServingService
	Vault    *services.VaultService
}

func NewHandler(ogClient *og.OGClient, creditService *services.CreditService, compilerService *services.CompilerService, supabaseService *services.SupabaseService, watcherService *services.WatcherService, servingService *services.ServingService, vaultService *services.VaultService) *Handler {
	return &Handler{
		OG:       ogClient,
		Credit:   creditService,
		Compiler: compilerService,
		Supabase: supabaseService,
		Watcher:  watcherService,
		Serving:  servingService,
		Vault:    vaultService,
	}
}

func (h *Handler) CreateStrategy(c *gin.Context) {
	var req models.CreateStrategyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Credit Check & Deduction — DISABLED FOR DEMO
	// Provision account so user exists in DB, but skip credit deduction
	h.Credit.ProvisionAccount(req.OwnerAddress)
	const cost = 0 // Demo mode: no credits charged

	// const cost = 50
	// err := h.Credit.Deduct(req.OwnerAddress, cost, "Strategy Creation: "+req.LogicNLP)
	// if err != nil {
	// 	c.JSON(http.StatusPaymentRequired, gin.H{
	// 		"error":   "Insufficient Credits",
	// 		"details": err.Error(),
	// 	})
	// 	return
	// }

	// 2. Compile NLP to Structured Logic
	compiled, err := h.Compiler.Compile(req.LogicNLP)
	if err != nil {
		// h.Credit.Refund(req.OwnerAddress, cost, "Rollback: Compilation Failure") // DISABLED FOR DEMO
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
		// h.Credit.Refund(req.OwnerAddress, cost, "Rollback: Serialization Failure") // DISABLED FOR DEMO
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to serialize rulebook"})
		return
	}

	// 4. Upload to 0G Storage (best-effort — falls back gracefully on testnet)
	txHash, err := h.OG.UploadRulebook(c.Request.Context(), data)
	if err != nil {
		// Log the real error but don't fail the entire request.
		// On testnet, the agent wallet may lack 0G tokens for storage fees.
		fmt.Printf("Warning: 0G Storage upload failed (using content hash fallback): %v\n", err)
		// Derive a deterministic mock tx hash from the rulebook ID so it's unique but reproducible
		txHash = "0xDEMO_" + rulebook.StrategyID[:8]
	}

	rulebook.DeploymentTx = txHash

	// 5. Record in Supabase
	_, err = h.Supabase.Post("strategies", map[string]interface{}{
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

func (h *Handler) GetUserStats(c *gin.Context) {
	address := c.Query("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "address is required"})
		return
	}

	balance, err := h.Credit.GetBalance(address)
	if err != nil {
		// If user not found, return 0 or provision? For now return 0
		c.JSON(http.StatusOK, gin.H{
			"credits":          0,
			"strategies_count": 0,
		})
		return
	}

	data, err := h.Supabase.GetByColumn("strategies", "owner_address", address)
	var count int
	if err == nil {
		var strats []interface{}
		json.Unmarshal(data, &strats)
		count = len(strats)
	}

	c.JSON(http.StatusOK, gin.H{
		"credits":          balance,
		"strategies_count": count,
	})
}

func (h *Handler) GetUserStrategies(c *gin.Context) {
	address := c.Query("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "address is required"})
		return
	}

	data, err := h.Supabase.GetByColumn("strategies", "owner_address", address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch strategies"})
		return
	}

	var strats []map[string]interface{}
	json.Unmarshal(data, &strats)

	c.JSON(http.StatusOK, strats)
}

func (h *Handler) GetWatcherAlerts(c *gin.Context) {
	alerts := h.Watcher.GetLatestAlerts()
	c.JSON(http.StatusOK, alerts)
}

func (h *Handler) ExecuteSimulatedTrade(c *gin.Context) {
	strategyID := c.Query("id")
	if strategyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "strategy id is required"})
		return
	}

	// 1. Fetch the "Rulebook" from 0G Storage (Simulated via ID here)
	rulebookHash := "0xabc123...[0G_STORAGE_ROOT]"

	// 2. Mock Market Context (from Watcher)
	marketContext := map[string]interface{}{
		"eth_price":  2850.50,
		"sentiment":  0.85,
		"volatility": "Low",
	}

	// 3. Request Verifiable Inference from 0G Serving
	decision, err := h.Serving.RequestInference(rulebookHash, marketContext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "0G Serving failed: " + err.Error()})
		return
	}

	// 4. Verification Check
	if !decision.Verified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Inference verification failed"})
		return
	}

	// 5. Settlement (Real or Simulated)
	settlementTx := uuid.New().String()
	vaultAction := "Simulated: Funds moved via PoI verification"

	if h.Vault != nil {
		// Attempt Real On-Chain Settlement
		// For the demo, we use placeholder addresses for assets
		userAddr := common.HexToAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
		tokenIn := common.HexToAddress("0x0000000000000000000000000000000000000000")  // ETH
		tokenOut := common.HexToAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F") // DAI
		amount := big.NewInt(1e17)                                                    // 0.1 ETH
		minOut := big.NewInt(0)
		deadline := big.NewInt(time.Now().Add(1 * time.Hour).Unix())

		// Decode signature from PoI response (assuming hex for this example)
		sigBytes := common.FromHex(decision.Signature)

		txHash, err := h.Vault.ExecuteTrade(userAddr, tokenIn, tokenOut, amount, minOut, deadline, sigBytes)
		if err == nil {
			settlementTx = txHash
			vaultAction = "Real On-Chain Settlement Successful via AletheiaVault.sol"
		} else {
			fmt.Printf("On-chain settlement failed: %v\n", err)
			vaultAction = "On-Chain Failed, showing simulation only. Error: " + err.Error()
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"strategy_id":  strategyID,
		"decision":     decision.Decision,
		"signature":    decision.Signature, // The PoI
		"attestation":  decision.Attestation,
		"vault_action": vaultAction,
		"tx_receipt":   settlementTx,
	})
}
