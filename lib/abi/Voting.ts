export const VotingAbi = [
  {
    "type": "function",
    "name": "whitelistVoter",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "voter", "type": "address" }],
    "outputs": [],
  },
  {
    "type": "function",
    "name": "createPoll",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "question", "type": "string" },
      { "name": "options", "type": "string[]" },
      { "name": "durationSeconds", "type": "uint256" }
    ],
    "outputs": [],
  },
  {
    "type": "function",
    "name": "vote",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "pollId", "type": "uint256" },
      { "name": "option", "type": "uint256" }
    ],
    "outputs": [],
  },
  {
    "type": "function",
    "name": "endPoll",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "pollId", "type": "uint256" }],
    "outputs": [],
  },
  {
    "type": "function",
    "name": "getPollResults",
    "stateMutability": "view",
    "inputs": [{ "name": "pollId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
  },
  {
    "type": "function",
    "name": "whitelistedVoters",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
  },
] as const;
