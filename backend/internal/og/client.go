package og

import (
	"context"
	"fmt"
	"log"

	"github.com/0gfoundation/0g-storage-client/common/blockchain"
	"github.com/0gfoundation/0g-storage-client/core"
	"github.com/0gfoundation/0g-storage-client/indexer"
	"github.com/0gfoundation/0g-storage-client/transfer"
	web3go "github.com/openweb3/web3go"
)

// OGClient wraps the 0G Storage SDK clients needed for upload operations.
type OGClient struct {
	Web3Client    *web3go.Client
	IndexerClient *indexer.Client
}

// NewOGClient initializes the 0G Storage client using the indexer endpoint.
// The indexer discovers available storage nodes automatically — no need to hardcode node URLs.
func NewOGClient(evmRpc, indexerEndpoint, privateKey string) (*OGClient, error) {
	// 1. Web3 client signs/pays on-chain storage submission transactions
	w3client, err := blockchain.NewWeb3(evmRpc, privateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Web3 client: %v", err)
	}

	// 2. Indexer client discovers available storage nodes on the testnet
	indexerClient, err := indexer.NewClient(indexerEndpoint, indexer.IndexerClientOption{})
	if err != nil {
		log.Printf("Warning: 0G indexer unavailable (%v). Uploads will use fallback hashes.", err)
		return &OGClient{Web3Client: w3client, IndexerClient: nil}, nil
	}

	log.Printf("0G Client Initialized — Indexer: %s", indexerEndpoint)

	return &OGClient{
		Web3Client:    w3client,
		IndexerClient: indexerClient,
	}, nil
}

// UploadRulebook serializes a strategy rulebook and uploads it to 0G Storage.
// Uses the indexer to automatically discover storage nodes (correct flow).
func (c *OGClient) UploadRulebook(ctx context.Context, data []byte) (string, error) {
	if c.IndexerClient == nil {
		return "", fmt.Errorf("indexer client not available")
	}

	// Create in-memory data object (NewDataInMemory returns (data, error) in v1.2.2)
	fileData, err := core.NewDataInMemory(data)
	if err != nil {
		return "", fmt.Errorf("failed to create in-memory data: %v", err)
	}

	// SplitableUpload uses the indexer to discover storage nodes automatically,
	// then submits the on-chain transaction and transfers segments to nodes.
	txHashes, _, err := c.IndexerClient.SplitableUpload(ctx, c.Web3Client, fileData, 256*1024, transfer.UploadOption{
		ExpectedReplica: 1,
		NRetries:        3,
	})
	if err != nil {
		return "", fmt.Errorf("0G upload failed: %v", err)
	}

	if len(txHashes) == 0 {
		return "", fmt.Errorf("upload succeeded but returned no transaction hashes")
	}

	return txHashes[0].Hex(), nil
}

func (c *OGClient) Close() {
	// web3go.Client does not require explicit teardown
}
