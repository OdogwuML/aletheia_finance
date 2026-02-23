const hre = require("hardhat");

async function main() {
    console.log("Deploying AletheiaVault to Galileo Testnet...");

    const AletheiaVault = await hre.ethers.getContractFactory("AletheiaVault");
    const vault = await AletheiaVault.deploy();

    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    console.log("AletheiaVault deployed to:", vaultAddress);

    // Authorize a mock 0G Serving Node for the demo
    const mockNodeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const tx = await vault.authorizeNode(mockNodeAddress);
    await tx.wait();
    console.log("Authorized mock 0G node:", mockNodeAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
