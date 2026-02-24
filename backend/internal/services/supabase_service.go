package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type SupabaseService struct {
	URL string
	Key string
}

func NewSupabaseService() *SupabaseService {
	return &SupabaseService{
		URL: os.Getenv("SUPABASE_URL"),
		Key: os.Getenv("SUPABASE_KEY"),
	}
}

func (s *SupabaseService) Post(table string, body interface{}) ([]byte, error) {
	jsonBody, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/rest/v1/%s", s.URL, table), bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase error: %s", string(b))
	}

	return io.ReadAll(resp.Body)
}

func (s *SupabaseService) Get(table string, walletAddress string) ([]byte, error) {
	return s.GetByColumn(table, "wallet_address", walletAddress)
}

func (s *SupabaseService) GetByColumn(table string, column string, value string) ([]byte, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/rest/v1/%s?%s=eq.%s", s.URL, table, column, value), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase error: %s", string(b))
	}

	return io.ReadAll(resp.Body)
}

func (s *SupabaseService) Patch(table string, walletAddress string, body interface{}) ([]byte, error) {
	jsonBody, _ := json.Marshal(body)
	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s/rest/v1/%s?wallet_address=eq.%s", s.URL, table, walletAddress), bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.Key)
	req.Header.Set("Authorization", "Bearer "+s.Key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase error: %s", string(b))
	}

	return io.ReadAll(resp.Body)
}
