// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AletheiaVault
 * @dev A trustless vault that only executes trades verified by the 0G Serving Network.
 */
contract AletheiaVault is Ownable {
    using ECDSA for bytes32;

    struct Trade {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amount;
        uint256 minAmountOut;
        uint256 timestamp;
        bool executed;
    }

    // Mapping to track authorized 0G Serving nodes
    mapping(address => bool) public authorizedNodes;
    
    // User balances
    mapping(address => uint256) public userBalances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event TradeExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amount);
    event NodeAuthorized(address indexed node);
    event NodeDeauthorized(address indexed node);

    constructor() Ownable(msg.sender) {}

    function authorizeNode(address node) external onlyOwner {
        authorizedNodes[node] = true;
        emit NodeAuthorized(node);
    }

    function deauthorizeNode(address node) external onlyOwner {
        authorizedNodes[node] = false;
        emit NodeDeauthorized(node);
    }

    function deposit() external payable {
        userBalances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Executes a trade only if it carries a valid signature from an authorized 0G node.
     * @param user The address of the user who owns the strategy.
     * @param tokenIn Asset to sell.
     * @param tokenOut Asset to buy.
     * @param amount Amount to sell.
     * @param minAmountOut Expected minimum output.
     * @param deadline Trade expiration.
     * @param signature The Proof-of-Inference (PoI) signature from 0G Serving.
     */
    function executeTrade(
        address user,
        address tokenIn,
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Trade deadline passed");
        require(userBalances[user] >= amount, "User has insufficient funds in vault");

        // Construct the hash of the trade parameters
        bytes32 messageHash = keccak256(abi.encodePacked(
            user,
            tokenIn,
            tokenOut,
            amount,
            minAmountOut,
            deadline
        )).toEthSignedMessageHash();

        // Verify that the signature comes from an authorized 0G Serving node
        address signer = messageHash.recover(signature);
        require(authorizedNodes[signer], "Signature not from an authorized 0G node");

        // Logic for actual swap would go here (e.g., Uniswap interaction)
        // For the demo, we just update the internal state
        userBalances[user] -= amount;
        
        emit TradeExecuted(user, tokenIn, tokenOut, amount);
    }
}
