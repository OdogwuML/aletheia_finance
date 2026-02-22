import os
import requests
import json
from dotenv import load_dotenv

def test_0g_connectivity():
    load_dotenv()
    
    rpc_url = os.getenv("OG_RPC_URL")
    storage_endpoint = os.getenv("OG_STORAGE_ENDPOINT")
    inference_endpoint = os.getenv("OG_INFERENCE_ENDPOINT")
    
    print("--- 0G Network Handshake ---")
    
    # 1. Test RPC
    try:
        payload = {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}
        response = requests.post(rpc_url, json=payload)
        if response.status_code == 200:
            print(f"[SUCCESS] RPC Connectivity: Block {int(response.json()['result'], 16)}")
        else:
            print(f"[FAILED] RPC Connectivity: Status {response.status_code}")
    except Exception as e:
        print(f"[ERROR] RPC Check Failed: {str(e)}")

    # 2. Test Storage
    try:
        response = requests.get(storage_endpoint)
        print(f"[INFO] Storage Endpoint Response: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Storage Check Failed: {str(e)}")

    # 3. Test Inference
    try:
        response = requests.get(inference_endpoint)
        print(f"[INFO] Inference Endpoint Response: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Inference Check Failed: {str(e)}")

if __name__ == "__main__":
    test_0g_connectivity()
