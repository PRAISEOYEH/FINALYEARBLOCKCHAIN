/* eslint-disable */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const UniversityVoting = await hre.ethers.getContractFactory("UniversityVoting");
  const contract = await UniversityVoting.deploy(deployer.address);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("UniversityVoting deployed:", address);

  const outDir = path.join(__dirname, "..", "lib", "contracts");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "deployed-addresses.json");

  let current = {};
  if (fs.existsSync(file)) current = JSON.parse(fs.readFileSync(file, "utf8"));

  const networkName = hre.network.name;
  const key = networkName.includes("sepolia") ? "baseSepolia" : networkName;
  current[key] = {
    ...(current[key] || {}),
    UniversityVoting: address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(file, JSON.stringify(current, null, 2));
  console.log("Saved addresses to", file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


