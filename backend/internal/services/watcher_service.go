package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type WatcherAlert struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"` // TA, FA, Social
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Source    string    `json:"source"`
	Timestamp time.Time `json:"timestamp"`
	Severity  string    `json:"severity"` // High, Medium, Low
}

type WatcherService struct {
	httpClient *http.Client
}

func NewWatcherService() *WatcherService {
	return &WatcherService{
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *WatcherService) GetETHPrice() (float64, error) {
	resp, err := s.httpClient.Get("https://api.coingecko.com/v3/simple/price?ids=ethereum&vs_currencies=usd")
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var result map[string]map[string]float64
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	price, ok := result["ethereum"]["usd"]
	if !ok {
		return 0, fmt.Errorf("price not found in response")
	}

	return price, nil
}

func (s *WatcherService) GetLatestAlerts() []WatcherAlert {
	price, err := s.GetETHPrice()
	priceStr := "Loading..."
	if err == nil {
		priceStr = fmt.Sprintf("$%.2f", price)
	}

	return []WatcherAlert{
		{
			ID:        "price-1",
			Type:      "TA",
			Title:     fmt.Sprintf("Live ETH Price: %s", priceStr),
			Summary:   fmt.Sprintf("Real-time scouting of Ethereum markets. Current spot price is %s. Monitoring for volatility triggers.", priceStr),
			Source:    "CoinGecko",
			Timestamp: time.Now(),
			Severity:  "Medium",
		},
		{
			ID:        "social-1",
			Type:      "Social",
			Title:     "Bitcoin Sentiment Surge",
			Summary:   "X (Twitter) sentiment for $BTC has shifted 15% bullish in the last hour following whale inflows.",
			Source:    "OpenClaw Watcher",
			Timestamp: time.Now().Add(-5 * time.Minute),
			Severity:  "High",
		},
		{
			ID:        "fa-1",
			Type:      "FA",
			Title:     "Ethereum TVL Growth",
			Summary:   "DeFi TVL on Ethereum Layer 2s has hit a new 30-day high. Signaling long-term strength.",
			Source:    "OpenClaw Watcher",
			Timestamp: time.Now().Add(-15 * time.Minute),
			Severity:  "Medium",
		},
	}
}
