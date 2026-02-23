package services

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const vaultABI = `[
	{
		"inputs": [
			{"internalType": "address", "name": "user", "type": "address"},
			{"internalType": "address", "name": "tokenIn", "type": "address"},
			{"internalType": "address", "name": "tokenOut", "type": "address"},
			{"internalType": "uint256", "name": "amount", "type": "uint256"},
			{"internalType": "uint256", "name": "minAmountOut", "type": "uint256"},
			{"internalType": "uint256", "name": "deadline", "type": "uint256"},
			{"internalType": "bytes", "name": "signature", "type": "bytes"}
		],
		"name": "executeTrade",
		"outputs": [],
		"stateMutability": "external",
		"type": "function"
	}
]`

type VaultService struct {
	client       *ethclient.Client
	privateKey   *ecdsa.PrivateKey
	vaultAddress common.Address
	parsedABI    abi.ABI
}

func NewVaultService(rpcURL, privKeyHex, vaultAddrHex string) (*VaultService, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RPC: %v", err)
	}

	privateKey, err := crypto.HexToECDSA(privKeyHex)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %v", err)
	}

	parsedABI, err := abi.JSON(strings.NewReader(vaultABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ABI: %v", err)
	}

	return &VaultService{
		client:       client,
		privateKey:   privateKey,
		vaultAddress: common.HexToAddress(vaultAddrHex),
		parsedABI:    parsedABI,
	}, nil
}

func (s *VaultService) ExecuteTrade(
	user common.Address,
	tokenIn common.Address,
	tokenOut common.Address,
	amount *big.Int,
	minAmountOut *big.Int,
	deadline *big.Int,
	signature []byte,
) (string, error) {
	publicKey := s.privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", fmt.Errorf("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := s.client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return "", err
	}

	gasPrice, err := s.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", err
	}

	data, err := s.parsedABI.Pack("executeTrade", user, tokenIn, tokenOut, amount, minAmountOut, deadline, signature)
	if err != nil {
		return "", err
	}

	chainID, err := s.client.NetworkID(context.Background())
	if err != nil {
		return "", err
	}

	tx := types.NewTransaction(nonce, s.vaultAddress, big.NewInt(0), 1000000, gasPrice, data)
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), s.privateKey)
	if err != nil {
		return "", err
	}

	err = s.client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		return "", err
	}

	return signedTx.Hash().Hex(), nil
}
