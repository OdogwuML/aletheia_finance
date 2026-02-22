package models

import "time"

type VaultStatus string

const (
	VaultActive   VaultStatus = "ACTIVE"
	VaultLocked   VaultStatus = "LOCKED"
	VaultInactive VaultStatus = "INACTIVE"
)

type Vault struct {
	VaultAddress string      `json:"vault_address"`
	OwnerAddress string      `json:"owner_address"`
	AgentAddress string      `json:"agent_address"`
	Status       VaultStatus `json:"status"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type TradeExecution struct {
	ExecutionID  string    `json:"execution_id"`
	VaultAddress string    `json:"vault_address"`
	StrategyID   string    `json:"strategy_id"`
	AssetIn      string    `json:"asset_in"`
	AssetOut     string    `json:"asset_out"`
	AmountIn     int64     `json:"amount_in"`
	AmountOut    int64     `json:"amount_out"`
	ProofHash    string    `json:"proof_hash"` // 0G TEE Proof Link
	TxHash       string    `json:"tx_hash"`    // On-chain Trade Hash
	Timestamp    time.Time `json:"timestamp"`
}
