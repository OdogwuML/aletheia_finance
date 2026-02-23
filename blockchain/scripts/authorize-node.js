/**
 * authorize-node.js
 * Run this to authorize a 0G Serving node on your deployed AletheiaVault.
 * Usage: npx hardhat run scripts/authorize-node.js --network galileo
 */
const hre = require("hardhat");

const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "0x9b6eF2eb94Fc756D2521DDc42Baeb4Ec3a3454C4";
// The 0G node to authorize — replace with actual production node when ready
const NODE_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function main() {
    console.log("Connecting to AletheiaVault at:", VAULT_ADDRESS);
    const vault = await hre.ethers.getContractAt("AletheiaVault", VAULT_ADDRESS);

    const [owner] = await hre.ethers.getSigners();
    console.log("Authorizing from owner account:", owner.address);

    console.log("Authorizing 0G node:", NODE_ADDRESS);
    const tx = await vault.authorizeNode(NODE_ADDRESS, {
        gasLimit: 100000,   // explicit gas limit for testnet
    });
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait(1); // wait for 1 confirmation
    console.log("✅ Node authorized! Block:", receipt.blockNumber);
    console.log("Explorer: https://chainscan-galileo.0g.ai/tx/" + tx.hash);
}

main().catch((error) => {
    console.error("Authorization failed:", error.message);
    process.exitCode = 1;
});
