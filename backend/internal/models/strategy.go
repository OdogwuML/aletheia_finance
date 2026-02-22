package models

import "time"

type StrategyStatus string

const (
	StatusActive   StrategyStatus = "ACTIVE"
	StatusPaused   StrategyStatus = "PAUSED"
	StatusArchived StrategyStatus = "ARCHIVED"
)

type StrategyRulebook struct {
	StrategyID        string         `json:"strategy_id"`
	OwnerAddress      string         `json:"owner_address"`
	LogicNLP          string         `json:"logic_nlp"`
	RuleEngineVersion string         `json:"rule_engine_version"`
	CompiledLogic     string         `json:"compiled_logic"` // JSON/Encrypted
	DeploymentTx      string         `json:"deployment_tx"`
	Status            StrategyStatus `json:"status"`
	CreatedAt         time.Time      `json:"created_at"`
}

type CreateStrategyRequest struct {
	LogicNLP     string `json:"logic_nlp" binding:"required"`
	OwnerAddress string `json:"owner_address" binding:"required"`
}
