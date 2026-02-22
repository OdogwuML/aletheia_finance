# Aletheia Finance - Project Constitution

## Data Schemas

### 1. StrategyRulebook (Input/Storage)
```json
{
  "strategy_id": "UUID",
  "owner_address": "0x...",
  "logic_nlp": "Plain English description",
  "rule_engine_version": "v1.0",
  "compiled_logic": "Serialized/Encrypted JSON",
  "deployment_tx": "0x...",
  "status": "ACTIVE | PAUSED | ARCHIVED"
}
```

### 2. CreditSystem (Economics)
```json
{
  "address": "0x...",
  "balance": 0.00,
  "history": [
    {
      "action": "STRATEGY_CREATE | TRADE_EXEC | SCAN",
      "cost": 50,
      "timestamp": "ISO8601"
    }
  ]
}
```

### 3. TradeReceipt (Output/Proof)
```json
{
  "receipt_id": "UUID",
  "strategy_id": "UUID",
  "action": "BUY | SELL",
  "params": {
    "token_in": "0x...",
    "token_out": "0x...",
    "amount": "string"
  },
  "proof_of_adherence": "0x_0G_PROOF_HASH",
  "on_chain_tx": "0x...",
  "timestamp": "ISO8601"
}
```

## Behavioral Rules
1. **Non-Custodial First:** The Agent identity must NEVER possess private keys with `transfer()` permissions.
2. **Determinism:** Any trade decision MUST be accompanied by a 0G Inference proof matching the `StrategyRulebook`.
3. **Credit Ceiling:** No actions allowed if user credit balance < required cost.

## Architectural Invariants
- 0G for verifiable off-chain execution.
- Smart Contract Vaults for fund security.
- Layer 3 (Tools) must handle the 0G Handshake via Go or Python engines.
- **Go Backend:** Acts as the deterministic middleware between UI and 0G/Blockchain.
- **React UI:** Non-custodial interface; keys stay in the user's browser (Wagmi/RainbowKit).
