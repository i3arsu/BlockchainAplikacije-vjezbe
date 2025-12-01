import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CrowdFund", function () {

    it("The goal should be set to 15 ethers", async function () {
        const crowdFund = await ethers.deployContract("CrowdFund", [15, 3]);
        const goal = await crowdFund.goal();
        expect(goal).to.equal(ethers.parseEther("15"));
    });


    it("Should accept donations and update the amountRaised", async function () {
        const crowdFund = await ethers.deployContract("CrowdFund", [15, 3]);

        await crowdFund.donate({ value: ethers.parseEther("1") });

        const amountRaised = await crowdFund.getBalance();
        expect(amountRaised).to.equal(ethers.parseEther("1"));
    });

    it("Only the owner should be able to withdraw funds after the deadline if the goal is met", async function () {
        const [owner, donor] = await ethers.getSigners();
        const crowdFund = await ethers.deployContract("CrowdFund", [1, 1]); // 1 ether goal, 1 minute duration

        // Donor donates 1 ether
        await crowdFund.connect(donor).donate({ value: ethers.parseEther("1") });

        // Fast forward time by 2 minutes to pass the deadline
        await ethers.provider.send("evm_increaseTime", [120]);
        await ethers.provider.send("evm_mine");

        // Owner withdraws funds
        const initialOwnerBalance = await owner.provider?.getBalance(owner.address) ?? 0n;
        const tx = await crowdFund.connect(owner).withdrawFunds();
        const receipt = await tx.wait();

        // calculate gas cost safely (handle missing fields in different ethers versions)
        const gasUsed = receipt?.gasUsed ?? 0n;
        const gasPrice = ((receipt as any)?.effectiveGasPrice) ?? (tx.gasPrice ?? 0n);
        const gasCost = gasUsed * gasPrice;

        const finalOwnerBalance = await owner.provider?.getBalance(owner.address) ?? 0n;
        expect(finalOwnerBalance).to.equal(initialOwnerBalance + ethers.parseEther("1") - gasCost);
    });

    it("Donors cannot withdraw funds if the goal is met", async function () {
        const [owner, donor] = await ethers.getSigners();
        const crowdFund = await ethers.deployContract("CrowdFund", [1, 1]); // 1 ether goal, 1 minute duration

        // Donor donates 1 ether
        await crowdFund.connect(donor).donate({ value: ethers.parseEther("1") });

        // Fast forward time by 2 minutes to pass the deadline
        await ethers.provider.send("evm_increaseTime", [120]);
        await ethers.provider.send("evm_mine");

        // Donor tries to withdraw funds
        await expect(
            crowdFund.connect(donor).withdrawFunds()
        ).to.be.revertedWith("Not the owner");
    });
});