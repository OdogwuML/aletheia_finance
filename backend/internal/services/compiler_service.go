package services

import (
	"errors"
	"strings"

	"github.com/aletheia-finance/core/backend/internal/models"
)

type CompilerService struct{}

func NewCompilerService() *CompilerService {
	return &CompilerService{}
}

// Compile translates plain English into structured StrategyRulebook logic.
// For v1, we use a robust pattern recognition engine.
func (s *CompilerService) Compile(nlp string) (models.CompiledLogic, error) {
	logic := models.CompiledLogic{
		Conditions: []models.Condition{},
	}

	input := strings.ToLower(nlp)

	// Step 1: Detect Action
	if strings.Contains(input, "buy") {
		logic.Action = "BUY"
	} else if strings.Contains(input, "sell") {
		logic.Action = "SELL"
	} else {
		return logic, errors.New("unrecognized action (must be BUY or SELL)")
	}

	// Step 2: Detect Asset (Simplified for MVP)
	assets := []string{"eth", "btc", "usdc", "0g"}
	foundAsset := false
	for _, a := range assets {
		if strings.Contains(input, a) {
			logic.Asset = strings.ToUpper(a)
			foundAsset = true
			break
		}
	}
	if !foundAsset {
		return logic, errors.New("no recognized asset found in strategy")
	}

	// Step 3: Parse Conditions
	// Pattern: "[Indicator] [Operator] [Value]"

	// RSI Pattern
	if strings.Contains(input, "rsi") {
		cond := models.Condition{Indicator: "RSI"}
		if strings.Contains(input, "below") || strings.Contains(input, "<") {
			cond.Operator = "<"
		} else if strings.Contains(input, "above") || strings.Contains(input, ">") {
			cond.Operator = ">"
		}

		// Extract numeric value (v1 logic)
		words := strings.Fields(input)
		for i, word := range words {
			if word == "rsi" && i+2 < len(words) {
				// Pattern check: "rsi is below 30" or "rsi below 30"
				val := words[i+2]
				if i+3 < len(words) && (words[i+1] == "is" || words[i+1] == "below" || words[i+1] == "above") {
					// handle "rsi is below 30" -> i+3
					if words[i+1] == "is" {
						val = words[i+3]
					}
				}
				cond.Value = val
				break
			}
		}
		if cond.Operator != "" && cond.Value != "" {
			logic.Conditions = append(logic.Conditions, cond)
		}
	}

	// Price Pattern
	if strings.Contains(input, "price") {
		cond := models.Condition{Indicator: "PRICE"}
		if strings.Contains(input, "below") || strings.Contains(input, "under") || strings.Contains(input, "<") {
			cond.Operator = "<"
		} else if strings.Contains(input, "above") || strings.Contains(input, "over") || strings.Contains(input, ">") {
			cond.Operator = ">"
		}

		// Basic value extraction for price
		words := strings.Fields(input)
		for _, word := range words {
			cleanWord := strings.TrimLeft(word, "$")
			if isNumeric(cleanWord) {
				cond.Value = cleanWord
				break
			}
		}

		if cond.Operator != "" && cond.Value != "" {
			logic.Conditions = append(logic.Conditions, cond)
		}
	}

	// If no specific technical conditions were parsed, accept as a fundamental/NLP-driven rule.
	// This allows strategies like "Buy ETH when on-chain active addresses grow..." to pass through.
	if len(logic.Conditions) == 0 {
		logic.Conditions = append(logic.Conditions, models.Condition{
			Indicator: "NLP_RULE",
			Operator:  "MATCH",
			Value:     nlp,
		})
	}

	return logic, nil
}

func isNumeric(s string) bool {
	if len(s) == 0 {
		return false
	}
	for _, r := range s {
		if (r < '0' || r > '9') && r != '.' {
			return false
		}
	}
	return true
}
