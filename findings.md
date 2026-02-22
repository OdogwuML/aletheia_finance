# Findings & Research

## Discovery Answers
1. **North Star:** Verifiable, decentralized trading infrastructure on 0G allowing retail traders to deploy custom AI strategies with 100% cryptographic proof.
2. **Integrations:** 0G Network (Storage, Inference, Proofs), DEXs (Uniswap, SushiSwap), DeFi protocols (Aave, Compound), Web3 Wallets (MetaMask/WalletConnect).
3. **Source of Truth:** 0G Network for strategy "Rulebooks" and cryptographic proofs. Blockchain for Vault state.
4. **Delivery Payload:** On-chain trade execution receipts + UI updates for credit balance and strategy performance.
5. **Behavioral Rules:** 
   - Non-custodial: User-only withdrawal, Agent restricted to `executeTrade()`.
   - NLP-Driven: Strategies defined in plain English, compiled to verifiable logic.
   - Credit-Based: Pay-as-you-go model (Creation: 50, Trade: 1, Execution: 5, Scan: 0.1).

## PRD Summary (v1.2)
- **Problem:** Manual strategy monitoring and "developer trust" in centralized bots.
- **Solution:** NLP Strategy Engine + 0G Storage/Inference for proof of adherence.
- **Security:** Agent can only swap within the Vault; cannot transfer funds out.

## Research
- [x] 0G Storage API for Rulebook persistence.
- [x] 0G Inference for proof-of-adherence generation.
- [x] Smart Contract Vault implementation (limited `executeTrade` permission).
- [ ] Go Backend (Gin/REST) integration for 0G Storage Go SDK.
- [ ] React/Next.js UI with Wagmi/RainbowKit for retail wallet interaction.

## Delivery Platform Analysis (Web vs. Native App)

| Feature | Web App (React/Next.js) | Native Mobile App (iOS/Android) |
| :--- | :--- | :--- |
| **Wallet Integration** | **Seamless:** Direct injection (MetaMask) is easy. | **Moderate:** Relies on WalletConnect. |
| **User Experience** | Fast access, desktop-focused trading. | Premium feel, home-screen persistence. |
| **Notifications** | Limited (Browser permissions required). | **Superior:** Push alerts for trade success. |
| **Security** | Standard Browser-level security. | **Biometrics:** FaceID/TouchID for Vault. |
| **Distribution** | Instant. No censorship. | Subject to App Store review/crypto bans. |
| **0G Interaction** | Easy via Browser JS/TS SDKs. | Requires bridges for certain Node patterns. |

### System Pilot Recommendation: 
**Web App (PWA)** - For a "Retail Gateway," ease of onboarding and direct wallet connectivity is the highest priority. A Web-based approach avoids App Store gatekeeping of decentralized tech. Native apps can be added in a later phase for high-frequency traders needing push alerts.

## UI/UX Requirements
- **Dashboard:** Credit balance, active strategies, trade history.
- **Creator:** NLP input field for strategy definition.
- **Vault:** Deposit/Withdraw interface with transaction proofs.

## Backend Requirements (Go)
- **Framework:** Gin (REST API).
- **SDKs:** 0G Storage Go SDK, Ethers-go (or similar for chain interaction).
- **Functionality:** Strategy compilation (NLP to Rulebook), Proof verification, Credit management.
