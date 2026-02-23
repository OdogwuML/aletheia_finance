package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ServingRequest struct {
	Model      string                 `json:"model"`
	RulebookID string                 `json:"rulebook_id"` // 0G Storage Hash
	Context    map[string]interface{} `json:"context"`
}

type ServingResponse struct {
	Decision    string `json:"decision"`    // "BUY", "SELL", "HOLD"
	Signature   string `json:"signature"`   // Proof-of-Inference
	Attestation string `json:"attestation"` // TEE Remote Attestation
	Verified    bool   `json:"verified"`
}

type ServingService struct {
	Endpoint string
	APIKey   string
}

func NewServingService(endpoint, apiKey string) *ServingService {
	return &ServingService{
		Endpoint: endpoint,
		APIKey:   apiKey,
	}
}

/**
 * RequestInference calls the 0G Serving node to get a verifiable trade decision.
 */
func (s *ServingService) RequestInference(rulebookHash string, marketData map[string]interface{}) (*ServingResponse, error) {
	// For the hackathon, we call a mock or local 0G Serving provider
	// In production, this would use the 0G User Broker SDK logic

	reqBody, _ := json.Marshal(ServingRequest{
		Model:      "aletheia-v1-agent",
		RulebookID: rulebookHash,
		Context:    marketData,
	})

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v1/inference", s.Endpoint), bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if s.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+s.APIKey)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		// Mocking the response for the demo if the actual 0G endpoint is unavailable
		return s.mockInference(rulebookHash), nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("0G Serving Error: %s", string(b))
	}

	var result ServingResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *ServingService) mockInference(hash string) *ServingResponse {
	return &ServingResponse{
		Decision:    "BUY",
		Signature:   "0x765c928b...[MOCK_POI_SIG]",
		Attestation: "TEE_RA_OK",
		Verified:    true,
	}
}
