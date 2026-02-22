package services

import (
	"errors"
	"sync"
	"time"

	"github.com/aletheia-finance/core/internal/models"
	"github.com/google/uuid"
)

var (
	ErrInsufficientBalance = errors.New("insufficient credit balance")
	ErrAccountNotFound     = errors.New("credit account not found")
)

type CreditService struct {
	mu       sync.RWMutex
	accounts map[string]*models.CreditAccount
	history  []models.CreditTransaction
}

func NewCreditService() *CreditService {
	return &CreditService{
		accounts: make(map[string]*models.CreditAccount),
		history:  make([]models.CreditTransaction, 0),
	}
}

// ProvisionAccount gives a new user initial credits (e.g., 500)
func (s *CreditService) ProvisionAccount(address string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.accounts[address]; !exists {
		s.accounts[address] = &models.CreditAccount{
			OwnerAddress: address,
			Balance:      500, // Starting balance
			UpdatedAt:    time.Now(),
		}
	}
}

func (s *CreditService) GetBalance(address string) (int64, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	acc, exists := s.accounts[address]
	if !exists {
		return 0, ErrAccountNotFound
	}
	return acc.Balance, nil
}

func (s *CreditService) Deduct(address string, amount int64, purpose string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	acc, exists := s.accounts[address]
	if !exists {
		return ErrAccountNotFound
	}

	if acc.Balance < amount {
		return ErrInsufficientBalance
	}

	acc.Balance -= amount
	acc.UpdatedAt = time.Now()

	// Record transaction
	s.history = append(s.history, models.CreditTransaction{
		TxID:         uuid.New().String(),
		OwnerAddress: address,
		Amount:       amount,
		Type:         models.TxDeduction,
		Purpose:      purpose,
		Timestamp:    time.Now(),
	})

	return nil
}

func (s *CreditService) Refund(address string, amount int64, purpose string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	acc, exists := s.accounts[address]
	if !exists {
		return ErrAccountNotFound
	}

	acc.Balance += amount
	acc.UpdatedAt = time.Now()

	s.history = append(s.history, models.CreditTransaction{
		TxID:         uuid.New().String(),
		OwnerAddress: address,
		Amount:       amount,
		Type:         models.TxRefund,
		Purpose:      purpose,
		Timestamp:    time.Now(),
	})

	return nil
}
