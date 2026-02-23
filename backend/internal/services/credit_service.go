package services

import (
	"encoding/json"
	"errors"
	"time"
)

var (
	ErrInsufficientBalance = errors.New("insufficient credit balance")
	ErrAccountNotFound     = errors.New("credit account not found")
)

type CreditService struct {
	supabase *SupabaseService
}

func NewCreditService(supabase *SupabaseService) *CreditService {
	return &CreditService{
		supabase: supabase,
	}
}

// ProvisionAccount gives a new user initial credits (e.g., 500)
func (s *CreditService) ProvisionAccount(address string) {
	// 1. Check if user exists
	data, err := s.supabase.get("users", address)
	if err != nil {
		return
	}

	var users []map[string]interface{}
	json.Unmarshal(data, &users)

	if len(users) == 0 {
		// Create user
		s.supabase.post("users", map[string]interface{}{
			"wallet_address": address,
			"credits":        500,
		})
	}
}

func (s *CreditService) GetBalance(address string) (int64, error) {
	data, err := s.supabase.get("users", address)
	if err != nil {
		return 0, err
	}

	var users []map[string]interface{}
	json.Unmarshal(data, &users)

	if len(users) == 0 {
		return 0, ErrAccountNotFound
	}

	return int64(users[0]["credits"].(float64)), nil
}

func (s *CreditService) Deduct(address string, amount int64, purpose string) error {
	balance, err := s.GetBalance(address)
	if err != nil {
		return err
	}

	if balance < amount {
		return ErrInsufficientBalance
	}

	newBalance := balance - amount
	_, err = s.supabase.patch("users", address, map[string]interface{}{
		"credits":    newBalance,
		"updated_at": time.Now(),
	})

	return err
}

func (s *CreditService) Refund(address string, amount int64, purpose string) error {
	balance, err := s.GetBalance(address)
	if err != nil {
		return err
	}

	newBalance := balance + amount
	_, err = s.supabase.patch("users", address, map[string]interface{}{
		"credits":    newBalance,
		"updated_at": time.Now(),
	})

	return err
}
