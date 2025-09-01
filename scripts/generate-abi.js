/* eslint-disable */
const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeAbiTs(artifactPath, outPath, exportName) {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi || [];
  const content = `export const ${exportName} = ${JSON.stringify(abi, null, 2)} as const;
export default ${exportName};
`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`Generated ABI TS: ${outPath}`);
}

function main() {
  const root = process.cwd();
  const artifactsDir = path.join(root, "artifacts", "contracts");
  const outDir = path.join(root, "lib", "abi");
  ensureDir(outDir);

  const uniVotingArtifact = path.join(
    artifactsDir,
    "UniversityVoting.sol",
    "UniversityVoting.json"
  );
  if (fs.existsSync(uniVotingArtifact)) {
    writeAbiTs(uniVotingArtifact, path.join(outDir, "UniversityVoting.ts"), "UniversityVotingABI");
  } else {
    console.warn("UniversityVoting artifact not found. Did you run hardhat compile?");
  }
}

main();


