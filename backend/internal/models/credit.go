package models

import "time"

type TransactionType string

const (
	TxDeposit   TransactionType = "DEPOSIT"
	TxDeduction TransactionType = "DEDUCTION"
	TxRefund    TransactionType = "REFUND"
)

type CreditAccount struct {
	OwnerAddress string    `json:"owner_address"`
	Balance      int64     `json:"balance"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CreditTransaction struct {
	TxID         string          `json:"tx_id"`
	OwnerAddress string          `json:"owner_address"`
	Amount       int64           `json:"amount"`
	Type         TransactionType `json:"type"`
	Purpose      string          `json:"purpose"`
	Timestamp    time.Time       `json:"timestamp"`
}
