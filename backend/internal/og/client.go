package og

import (
	"context"
	"fmt"
	"log"

	"github.com/0gfoundation/0g-storage-client/common/blockchain"
	"github.com/0gfoundation/0g-storage-client/core"
	"github.com/0gfoundation/0g-storage-client/indexer"
	"github.com/0gfoundation/0g-storage-client/transfer"
)

type OGClient struct {
	Web3Client    *blockchain.Web3
	IndexerClient *indexer.Client
}

func NewOGClient(evmRpc, indRpc, privateKey string) (*OGClient, error) {
	// 1. Create Web3 client for blockchain interactions
	w3client, err := blockchain.NewWeb3(evmRpc, privateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Web3 client: %v", err)
	}

	// 2. Create indexer client for node management
	indexerClient, err := indexer.NewClient(indRpc)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize indexer client: %v", err)
	}

	// 3. Initialize Transfer Flow for data uploads
	// Note: We'll refine the flow initialization as we implement strategy uploads

	log.Printf("0G Client Initialized - Connected to Indexer: %s", indRpc)

	return &OGClient{
		Web3Client:    w3client,
		IndexerClient: indexerClient,
	}, nil
}

// UploadRulebook takes a strategy rulebook (serialized as bytes) and uploads it to 0G Storage.
func (c *OGClient) UploadRulebook(ctx context.Context, data []byte) (string, error) {
	// 1. Create Data from bytes
	fileData := core.NewDataInMemory(data)

	// 2. Initialize Transfer Flow
	flow, err := transfer.NewFlow(c.Web3Client, c.IndexerClient)
	if err != nil {
		return "", fmt.Errorf("failed to create transfer flow: %v", err)
	}

	// 3. Upload the data
	txHash, _, err := flow.Upload(ctx, fileData)
	if err != nil {
		return "", fmt.Errorf("failed to upload data to 0G: %v", err)
	}

	return txHash.Hex(), nil
}

func (c *OGClient) Close() {
	if c.Web3Client != nil {
		c.Web3Client.Close()
	}
}
