const hre = require("hardhat");

async function main() {
    console.log("Deploying AletheiaVault to Galileo Testnet...");

    const AletheiaVault = await hre.ethers.getContractFactory("AletheiaVault");
    const vault = await AletheiaVault.deploy();

    await vault.deployed();

    console.log("AletheiaVault deployed to:", vault.address);

    // Authorize a mock 0G Serving Node for the demo
    const mockNodeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    await vault.authorizeNode(mockNodeAddress);
    console.log("Authorized mock 0G node:", mockNodeAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
