import { createPublicClient, http, type PublicClient, type WalletClient } from "viem";
import { baseSepolia } from "wagmi/chains";
import addresses from "../contracts/deployed-addresses.json";
import { UniversityVotingABI } from "../abi/UniversityVoting";

type ChainId = typeof baseSepolia.id;

// Type for onchain election data
export interface OnchainElection {
  title: string;
  description: string;
  positions: any[];
  candidates: any[];
  startTime: bigint | string;
  endTime: bigint | string;
}

const getAddressForNetwork = (chainId: number): `0x${string}` => {
  const net = chainId === baseSepolia.id ? "baseSepolia" : "localhost";
  const addr = (addresses as any)[net]?.UniversityVoting;
  if (!addr) throw new Error(`UniversityVoting address not configured for ${net}`);
  return addr as `0x${string}`;
};

export const UniversityVotingContract = (chainId: ChainId = baseSepolia.id) => {
  const address = getAddressForNetwork(chainId);
  return { address, abi: UniversityVotingABI } as const;
};

// Create a public client for read operations
const createPublicClientForChain = (chainId: ChainId) => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
  return createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
};

export async function getElection(chainId: ChainId, electionId: bigint): Promise<OnchainElection> {
  const publicClient = createPublicClientForChain(chainId);
  const { address, abi } = UniversityVotingContract(chainId);
  return publicClient.readContract({ address, abi, functionName: "getElection", args: [electionId] }) as Promise<OnchainElection>;
}

export async function getCandidate(chainId: ChainId, electionId: bigint, candidateId: bigint) {
  const publicClient = createPublicClientForChain(chainId);
  const { address, abi } = UniversityVotingContract(chainId);
  return publicClient.readContract({ address, abi, functionName: "getCandidate", args: [electionId, candidateId] });
}

export async function hasVoted(chainId: ChainId, voter: `0x${string}`, electionId: bigint, positionId: bigint) {
  const publicClient = createPublicClientForChain(chainId);
  const { address, abi } = UniversityVotingContract(chainId);
  return publicClient.readContract({ address, abi, functionName: "hasVoted", args: [voter, electionId, positionId] });
}

export async function createElection(
  chainId: ChainId,
  walletClient: WalletClient,
  title: string,
  description: string,
  startTime: bigint,
  endTime: bigint,
  positions: { title: string; requirements: string }[]
) {
  const { address, abi } = UniversityVotingContract(chainId);

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName: "createElection",
    args: [title, description, startTime, endTime, positions],
  });

  const publicClient = createPublicClientForChain(chainId);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function addCandidate(
  chainId: ChainId,
  walletClient: WalletClient,
  electionId: bigint,
  positionId: bigint,
  studentWallet: `0x${string}`,
  name: string
) {
  const { address, abi } = UniversityVotingContract(chainId);

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName: "addCandidate",
    args: [electionId, positionId, studentWallet, name],
  });

  const publicClient = createPublicClientForChain(chainId);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function verifyCandidate(
  chainId: ChainId,
  walletClient: WalletClient,
  electionId: bigint,
  candidateId: bigint
) {
  const { address, abi } = UniversityVotingContract(chainId);

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName: "verifyCandidate",
    args: [electionId, candidateId],
  });

  const publicClient = createPublicClientForChain(chainId);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function castVote(
  chainId: ChainId,
  walletClient: WalletClient,
  electionId: bigint,
  positionId: bigint,
  candidateId: bigint
) {
  const { address, abi } = UniversityVotingContract(chainId);

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName: "castVote",
    args: [electionId, positionId, candidateId],
  });

  const publicClient = createPublicClientForChain(chainId);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export function onVoteCast(chainId: ChainId, handler: (log: any) => void) {
  const { address, abi } = UniversityVotingContract(chainId);
  const publicClient = createPublicClientForChain(chainId);
  return publicClient.watchContractEvent({
    address,
    abi,
    eventName: "VoteCast",
    onLogs: (logs) => logs.forEach(handler),
  });
}
