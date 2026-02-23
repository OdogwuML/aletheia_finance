package services

import (
	"testing"
)

func TestCompile(t *testing.T) {
	service := NewCompilerService()

	tests := []struct {
		name   string
		nlp    string
		action string
		asset  string
		valid  bool
	}{
		{
			name:   "RSI Buy Strategy",
			nlp:    "Buy ETH when RSI is below 30",
			action: "BUY",
			asset:  "ETH",
			valid:  true,
		},
		{
			name:   "Price Sell Strategy",
			nlp:    "Sell BTC if Price is above 70000",
			action: "SELL",
			asset:  "BTC",
			valid:  true,
		},
		{
			name:  "Invalid Action",
			nlp:   "Hold USDC forever",
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			logic, err := service.Compile(tt.nlp)
			if (err == nil) != tt.valid {
				t.Errorf("Compile() error = %v, wantValid %v", err, tt.valid)
				return
			}
			if tt.valid {
				if logic.Action != tt.action {
					t.Errorf("Action = %v, want %v", logic.Action, tt.action)
				}
				if logic.Asset != tt.asset {
					t.Errorf("Asset = %v, want %v", logic.Asset, tt.asset)
				}
				if len(logic.Conditions) == 0 {
					t.Errorf("Conditions empty, want at least one")
				}
			}
		})
	}
}
