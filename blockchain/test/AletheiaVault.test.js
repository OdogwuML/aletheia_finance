const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Helper: Signs a trade payload using the EIP-191 personal_sign style,
 * matching what AletheiaVault uses via `toEthSignedMessageHash()`.
 */
async function signTrade(signer, user, tokenIn, tokenOut, amount, minAmountOut, deadline) {
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address", "address", "uint256", "uint256", "uint256"],
        [user, tokenIn, tokenOut, amount, minAmountOut, deadline]
    );
    // ethers v6: signMessage automatically prefixes with "\x19Ethereum Signed Message:\n32"
    return await signer.signMessage(ethers.getBytes(messageHash));
}

describe("AletheiaVault", function () {
    let vault;
    let owner;      // Contract deployer (Aletheia operator)
    let user;       // Regular DeFi user who deposits funds
    let node;       // Authorized 0G Serving node (signs PoI)
    let attacker;   // Unauthorized address used for negative tests

    const ETH_1 = ethers.parseEther("1.0");
    const ETH_HALF = ethers.parseEther("0.5");

    // ─── Setup ───────────────────────────────────────────────────────────────────
    beforeEach(async function () {
        [owner, user, node, attacker] = await ethers.getSigners();

        const AletheiaVault = await ethers.getContractFactory("AletheiaVault");
        vault = await AletheiaVault.deploy();
        await vault.waitForDeployment();
    });

    // ─── Deployment ──────────────────────────────────────────────────────────────
    describe("📦 Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await vault.owner()).to.equal(owner.address);
        });

        it("Should start with no authorized nodes", async function () {
            expect(await vault.authorizedNodes(node.address)).to.be.false;
        });
    });

    // ─── Node Authorization ───────────────────────────────────────────────────────
    describe("🔐 Node Authorization", function () {
        it("Owner can authorize a 0G Serving node", async function () {
            await expect(vault.connect(owner).authorizeNode(node.address))
                .to.emit(vault, "NodeAuthorized")
                .withArgs(node.address);
            expect(await vault.authorizedNodes(node.address)).to.be.true;
        });

        it("Owner can deauthorize a node", async function () {
            await vault.connect(owner).authorizeNode(node.address);
            await expect(vault.connect(owner).deauthorizeNode(node.address))
                .to.emit(vault, "NodeDeauthorized")
                .withArgs(node.address);
            expect(await vault.authorizedNodes(node.address)).to.be.false;
        });

        it("Non-owner CANNOT authorize a node", async function () {
            await expect(vault.connect(attacker).authorizeNode(node.address))
                .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
        });

        it("Non-owner CANNOT deauthorize a node", async function () {
            await vault.connect(owner).authorizeNode(node.address);
            await expect(vault.connect(attacker).deauthorizeNode(node.address))
                .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
        });
    });

    // ─── Deposits & Withdrawals ───────────────────────────────────────────────────
    describe("💰 Deposits & Withdrawals", function () {
        it("User can deposit ETH into the vault", async function () {
            await expect(vault.connect(user).deposit({ value: ETH_1 }))
                .to.emit(vault, "Deposit")
                .withArgs(user.address, ETH_1);
            expect(await vault.userBalances(user.address)).to.equal(ETH_1);
        });

        it("User can withdraw ETH from the vault", async function () {
            await vault.connect(user).deposit({ value: ETH_1 });
            await expect(vault.connect(user).withdraw(ETH_HALF))
                .to.emit(vault, "Withdrawal")
                .withArgs(user.address, ETH_HALF);
            expect(await vault.userBalances(user.address)).to.equal(ETH_HALF);
        });

        it("Withdraw reverts if balance is insufficient", async function () {
            await vault.connect(user).deposit({ value: ETH_HALF });
            await expect(vault.connect(user).withdraw(ETH_1))
                .to.be.revertedWith("Insufficient balance");
        });
    });

    // ─── Trade Execution (The Core PoI Logic) ────────────────────────────────────
    describe("⚡ Trade Execution (Proof-of-Inference)", function () {
        let tokenIn, tokenOut, amount, minAmountOut, deadline;

        beforeEach(async function () {
            // Setup: authorize the 0G node and deposit funds for the user
            await vault.connect(owner).authorizeNode(node.address);
            await vault.connect(user).deposit({ value: ETH_1 });

            tokenIn = "0x0000000000000000000000000000000000000001"; // Mock ETH address
            tokenOut = "0x0000000000000000000000000000000000000002"; // Mock DAI address
            amount = ETH_HALF;
            minAmountOut = 0n;
            deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
        });

        it("✅ PASS: Valid PoI signature from authorized node executes the trade", async function () {
            const sig = await signTrade(node, user.address, tokenIn, tokenOut, amount, minAmountOut, deadline);

            await expect(vault.executeTrade(user.address, tokenIn, tokenOut, amount, minAmountOut, deadline, sig))
                .to.emit(vault, "TradeExecuted")
                .withArgs(user.address, tokenIn, tokenOut, amount);

            // Balance should be deducted
            expect(await vault.userBalances(user.address)).to.equal(ETH_HALF);
        });

        it("❌ REJECT: Reverts if signature is from an UNAUTHORIZED signer", async function () {
            // Attacker signs the trade - this should be rejected
            const sig = await signTrade(attacker, user.address, tokenIn, tokenOut, amount, minAmountOut, deadline);
            await expect(
                vault.executeTrade(user.address, tokenIn, tokenOut, amount, minAmountOut, deadline, sig)
            ).to.be.revertedWith("Signature not from an authorized 0G node");
        });

        it("❌ REJECT: Reverts if deadline has passed (expired PoI)", async function () {
            const expiredDeadline = BigInt(Math.floor(Date.now() / 1000) - 100); // In the past
            const sig = await signTrade(node, user.address, tokenIn, tokenOut, amount, minAmountOut, expiredDeadline);
            await expect(
                vault.executeTrade(user.address, tokenIn, tokenOut, amount, minAmountOut, expiredDeadline, sig)
            ).to.be.revertedWith("Trade deadline passed");
        });

        it("❌ REJECT: Reverts if user has insufficient vault balance", async function () {
            const tooMuch = ethers.parseEther("10.0"); // More than user deposited
            const sig = await signTrade(node, user.address, tokenIn, tokenOut, tooMuch, minAmountOut, deadline);
            await expect(
                vault.executeTrade(user.address, tokenIn, tokenOut, tooMuch, minAmountOut, deadline, sig)
            ).to.be.revertedWith("User has insufficient funds in vault");
        });

        it("❌ REJECT: Reverts if signature is tampered (wrong parameters)", async function () {
            // Sign for amount X, but try to execute for amount Y
            const sig = await signTrade(node, user.address, tokenIn, tokenOut, amount, minAmountOut, deadline);
            const tamperedAmount = ethers.parseEther("0.9"); // Different amount
            await expect(
                vault.executeTrade(user.address, tokenIn, tokenOut, tamperedAmount, minAmountOut, deadline, sig)
            ).to.be.revertedWith("Signature not from an authorized 0G node");
        });

        it("❌ REJECT: Reverts if node is deauthorized after signing", async function () {
            const sig = await signTrade(node, user.address, tokenIn, tokenOut, amount, minAmountOut, deadline);
            // Owner deauthorizes the node between signing and execution
            await vault.connect(owner).deauthorizeNode(node.address);
            await expect(
                vault.executeTrade(user.address, tokenIn, tokenOut, amount, minAmountOut, deadline, sig)
            ).to.be.revertedWith("Signature not from an authorized 0G node");
        });
    });
});
