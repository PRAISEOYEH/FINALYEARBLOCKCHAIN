const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting, owner, voter, other;

  beforeEach(async function () {
    [owner, voter, other] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.connect(owner).deploy(owner.address);
    await voting.deployed();
  });

  it("whitelists a voter", async function () {
    await voting.connect(owner).whitelistVoter(voter.address);
    expect(await voting.whitelistedVoters(voter.address)).to.equal(true);
  });

  it("creates a poll and allows voting, then prevents viewing results until ended", async function () {
    await voting.connect(owner).whitelistVoter(voter.address);
    await voting.connect(owner).createPoll("Best Color?", ["Red", "Blue"], 3600);
    await voting.connect(voter).vote(0, 0);
    await expect(voting.getPollResults(0)).to.be.revertedWith("Poll must be ended to view results");

    await voting.connect(owner).endPoll(0);
    const results = await voting.getPollResults(0);
    expect(results[0]).to.equal(1n);
    expect(results[1]).to.equal(0n);
  });

  it("prevents double voting", async function () {
    await voting.connect(owner).whitelistVoter(voter.address);
    await voting.connect(owner).createPoll("Test", ["Yes", "No"], 3600);
    await voting.connect(voter).vote(0, 0);
    await expect(voting.connect(voter).vote(0, 0)).to.be.revertedWith("Already voted");
  });

  it("enforces timing window", async function () {
    await voting.connect(owner).whitelistVoter(voter.address);
    await voting.connect(owner).createPoll("Time", ["A", "B"], 1);
    // Wait 2 seconds to pass endTime
    await new Promise((r) => setTimeout(r, 2000));
    await expect(voting.connect(voter).vote(0, 0)).to.be.revertedWith("Poll time invalid");
  });
});
