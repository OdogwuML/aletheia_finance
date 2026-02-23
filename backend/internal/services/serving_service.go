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
	// If endpoint is not set, we default to mock mode for the hackathon/demo
	if s.Endpoint == "" || s.Endpoint == "MOCK" {
		return s.mockInference(rulebookHash), nil
	}

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
		return nil, fmt.Errorf("0G Serving node unreachable: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("0G Serving Error (Status %d): %s", resp.StatusCode, string(b))
	}

	var result ServingResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode 0G Serving response: %v", err)
	}

	return &result, nil
}

func (s *ServingService) mockInference(hash string) *ServingResponse {
	return &ServingResponse{
		Decision:    "BUY",
		Signature:   "0x765c928b...[POI_SIGNATURE]",
		Attestation: "TEE_REMOTE_ATTESTATION_OK",
		Verified:    true,
	}
}
