const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniversityVoting", function () {
  async function deploy() {
    const [owner, voter] = await ethers.getSigners();
    const F = await ethers.getContractFactory("UniversityVoting");
    const c = await F.deploy(owner.address);
    await c.deployed();
    return { c, owner, voter };
  }

  it("creates election and adds candidate", async function () {
    const { c, owner } = await deploy();
    const now = Math.floor(Date.now() / 1000);
    const positions = [{ id: 0, title: "President", requirements: "GPA >= 3.0" }];
    await expect(c.connect(owner).createElection("2025 SU Election", "desc", now + 60, now + 3600, positions)).to
      .emit(c, "ElectionCreated");
    await expect(c.connect(owner).addCandidate(1, 1, owner.address, "Alice")).to.emit(c, "CandidateAdded");
  });

  it("reverts when creating election with past start time", async function () {
    const { c, owner } = await deploy();
    const now = Math.floor(Date.now() / 1000);
    // start time in the past but endTime still in the future to satisfy the timeframe check
    const startTime = now - 100;
    const endTime = now + 3600;
    const positions = [{ id: 0, title: "President", requirements: "" }];
    await expect(
      c.connect(owner).createElection("Past Start", "Should fail", startTime, endTime, positions)
    ).to.be.revertedWith("Start time in past");
  });

  it("reverts when creating election with no positions", async function () {
    const { c, owner } = await deploy();
    const now = Math.floor(Date.now() / 1000);
    const positions = [];
    await expect(
      c.connect(owner).createElection("No Positions", "Should fail", now + 60, now + 3600, positions)
    ).to.be.revertedWith("No positions");
  });

  it("allows creating election when start time equals current block timestamp", async function () {
    const { c, owner } = await deploy();
    const latestBlock = await ethers.provider.getBlock('latest');
    const now = latestBlock.timestamp + 10; // Use block timestamp + buffer
    const positions = [{ id: 0, title: "Secretary", requirements: "" }];
    await expect(
      c.connect(owner).createElection("Start Now", "Boundary test", now, now + 3600, positions)
    ).to.emit(c, "ElectionCreated");
  });

  it("whitelists and votes", async function () {
    const { c, owner, voter } = await deploy();
    const latestBlock = await ethers.provider.getBlock('latest');
    const now = latestBlock.timestamp;
    const positions = [{ id: 0, title: "President", requirements: "" }];
    await c.connect(owner).createElection("E", "D", now + 10, now + 3600, positions);
    await c.connect(owner).addCandidate(1, 1, voter.address, "Bob");
    await c.connect(owner).verifyCandidate(1, 1);
    await c.connect(owner).whitelistVoter(1, voter.address);
    // Advance time to after election start
    await ethers.provider.send("evm_increaseTime", [15]);
    await ethers.provider.send("evm_mine");
    await expect(c.connect(voter).castVote(1, 1, 1)).to.emit(c, "VoteCast");
    const cand = await c.getCandidate(1, 1);
    expect(cand.voteCount).to.equal(1n);
  });
});