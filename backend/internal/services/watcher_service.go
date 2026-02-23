package services

import (
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

type WatcherService struct{}

func NewWatcherService() *WatcherService {
	return &WatcherService{}
}

func (s *WatcherService) GetLatestAlerts() []WatcherAlert {
	return []WatcherAlert{
		{
			ID:        "1",
			Type:      "Social",
			Title:     "Bitcoin Sentiment Surge",
			Summary:   "X (Twitter) sentiment for $BTC has shifted 15% bullish in the last hour following whale inflows.",
			Source:    "OpenClaw Watcher",
			Timestamp: time.Now().Add(-5 * time.Minute),
			Severity:  "High",
		},
		{
			ID:        "2",
			Type:      "FA",
			Title:     "Ethereum TVL Growth",
			Summary:   "DeFi TVL on Ethereum Layer 2s has hit a new 30-day high. Signaling long-term strength.",
			Source:    "OpenClaw Watcher",
			Timestamp: time.Now().Add(-15 * time.Minute),
			Severity:  "Medium",
		},
		{
			ID:        "3",
			Type:      "TA",
			Title:     "Price Deviation Detected",
			Summary:   "ETH/USD has deviated 3% from the 200-day EMA. Triggering potential re-entry logic.",
			Source:    "OpenClaw Watcher",
			Timestamp: time.Now().Add(-30 * time.Minute),
			Severity:  "Medium",
		},
	}
}
