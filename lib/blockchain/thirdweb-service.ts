import { z } from "zod";
import { getWalletClient, getPublicClient } from "wagmi/actions";
import { type GetWalletClientReturnType } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { UniversityVotingContract, createElection as vcCreateElection, verifyCandidate as vcVerifyCandidate, addCandidate as vcAddCandidate, castVote as vcCastVote } from "./voting-service";
import {
  addElectionMapping,
  addPositionMapping,
  addCandidateMapping,
} from "../contracts/id-map";

const API_BASE = "https://api.thirdweb.com";

const getHeaders = (useSecret: boolean = true) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (useSecret) {
    const secret = process.env.THIRDWEB_SECRET_KEY as string;
    if (!secret) throw new Error("THIRDWEB_SECRET_KEY missing");
    headers["x-secret-key"] = secret;
  } else {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string;
    if (clientId) headers["x-client-id"] = clientId;
  }
  return headers;
};

function isValidAddress(address: string) {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Try to normalize a function signature using thirdweb signatures endpoint.
 * If normalization fails for any reason, return the original method string.
 */
async function normalizeSignature(method: string): Promise<string> {
  try {
    const normalizeEndpoint = `${API_BASE}/v1/contracts/signatures`;
    const res = await fetch(normalizeEndpoint, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ method }),
    });
    if (!res.ok) {
      // If the endpoint isn't available or returns an error, fallback to original
      return method;
    }
    const data = await res.json();
    // Expecting data.result or data[0] as the normalized signature; be defensive
    if (!data) return method;
    if (Array.isArray(data.result) && typeof data.result[0] === "string") {
      return data.result[0];
    }
    if (Array.isArray(data) && typeof data[0] === "string") {
      return data[0];
    }
    // Not in expected format -> fallback
    return method;
  } catch (err) {
    // Network or parsing error -> fallback silently
    return method;
  }
}

/**
 * NOTE:
 * The file previously used thirdweb REST APIs for contract deployment and server wallets.
 * The project has been migrated to use wagmi/viem direct contract interactions via voting-service.ts.
 * The functions below provide replacements that call into voting-service where possible.
 */

/**
 * Legacy stub: server wallet creation via thirdweb is deprecated.
 * This function intentionally throws to indicate server-side signer setup should be handled
 * differently (e.g. use a server signer configured with viem/wagmi or require the client to sign).
 */
export async function createServerWallet(identifier: string) {
  throw new Error(
    "createServerWallet is deprecated in this codebase. Please manage server-side wallets with your own signer (viem/wagmi)."
  );
}

/**
 * Legacy stub: contract deployment via thirdweb REST is deprecated.
 * For deployments, use your preferred deployment tooling (hardhat, forge, thirdweb CLI)
 * and then update lib/contracts/deployed-addresses.json accordingly.
 */
export async function deployElectionContract(payload: {
  chainId: number;
  from: string;
  abi: any[];
  bytecode: string;
  constructorParams?: Record<string, any>;
}) {
  throw new Error(
    "deployElectionContract via thirdweb REST is deprecated. Deploy contracts with your preferred tooling and register deployed addresses in deployed-addresses.json."
  );
}

/**
 * Utility: Ensure we have a wallet client. If the caller didn't provide one,
 * attempt to get a wallet client for the chain using wagmi's getWalletClient.
 * Throws if unable to obtain a wallet client.
 */
async function ensureWalletClient(
  chainId: number,
  walletClient?: GetWalletClientReturnType | undefined
) {
  if (walletClient) return walletClient;
  try {
    const client = await getWalletClient(wagmiConfig, { chainId });
    if (!client) throw new Error("Failed to obtain wallet client");
    return client;
  } catch (err) {
    throw new Error(
      `Wallet client is required for this operation but could not be obtained: ${(err as Error).message}`
    );
  }
}

/**
 * Attempt to estimate gas for a contract call using the public client.
 * This will gracefully return undefined if estimation isn't supported or fails.
 */
async function tryEstimateGas(options: {
  chainId: number;
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args?: any[];
}) {
  const { chainId, address, abi, functionName, args = [] } = options;
  try {
    const publicClient = getPublicClient(wagmiConfig, { chainId });
    // Many viem/publicClient implementations expose estimateContractGas
    if (typeof (publicClient as any).estimateContractGas === "function") {
      const gas = await (publicClient as any).estimateContractGas({
        address,
        abi,
        functionName,
        args,
      });
      return gas;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Heuristic parser: try to extract any reasonable on-chain ID (bigint) from a transaction receipt logs.
 * This is a best-effort approach: contracts may emit different events; calling code should validate the mapping.
 */
function parseOnchainIdFromReceipt(receipt: any): bigint | null {
  try {
    if (!receipt || !Array.isArray(receipt.logs)) return null;
    for (const log of receipt.logs) {
      // Check topics first (they are hex strings)
      if (Array.isArray(log.topics)) {
        for (const t of log.topics) {
          if (typeof t === "string" && /^0x[0-9a-fA-F]+$/.test(t)) {
            try {
              // Skip topic[0] (event signature) heuristically by looking for non-zero values
              const asBig = BigInt(t);
              if (asBig > 0n) return asBig;
            } catch {
              // ignore
            }
          }
        }
      }
      // Check data field (hex blob); split into 32-byte words
      if (typeof log.data === "string" && log.data.startsWith("0x")) {
        const hex = log.data.slice(2);
        // Break into 64-char chunks (32 bytes)
        for (let i = 0; i < hex.length; i += 64) {
          const chunk = hex.slice(i, i + 64);
          if (!chunk) continue;
          try {
            const value = BigInt(`0x${chunk}`);
            if (value > 0n) return value;
          } catch {
            // ignore parse errors
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Whitelist a voter for a specific election on a specific contract.
 * This version uses a direct wallet client (wagmi/viem) to write to the contract.
 * It will attempt gas estimation and returns transaction hash + receipt for UI tracking.
 */
export async function whitelistVoter(
  electionContract: string,
  electionId: number,
  voter: string,
  options?: {
    chainId?: number;
    walletClient?: GetWalletClientReturnType;
  }
) {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || options?.chainId || 84532);
  // Input validation
  if (!electionContract || !isValidAddress(electionContract)) {
    throw new Error("Invalid electionContract address");
  }
  if (!Number.isFinite(electionId) || electionId < 0) {
    throw new Error("Invalid electionId; must be a non-negative integer");
  }
  if (!voter || !isValidAddress(voter)) {
    throw new Error("Invalid voter address");
  }

  const { address, abi } = UniversityVotingContract(chainId);
  const client = await ensureWalletClient(chainId, options?.walletClient);

  // Attempt gas estimation (best-effort)
  const estimatedGas = await tryEstimateGas({
    chainId,
    address,
    abi,
    functionName: "whitelistVoter",
    args: [BigInt(electionId), voter],
  });

  try {
    // use client's writeContract; the shape matches how voting-service performs writes
    const hash = await (client as any).writeContract({
      address,
      abi,
      functionName: "whitelistVoter",
      args: [BigInt(electionId), voter],
    });

    const publicClient = getPublicClient(wagmiConfig, { chainId });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return { hash, receipt, estimatedGas };
  } catch (err: any) {
    const message =
      err && err.message ? String(err.message) : "Unknown error while whitelisting voter";
    throw new Error(`Failed to whitelist voter: ${message}`);
  }
}

/**
 * Create election as admin by calling the contract via wagmi/viem through voting-service.
 * Integrates local ID mapping (adds an UI -> onchain mapping) whenever possible.
 */
export async function createElectionAsAdmin(payload: {
  contract: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  positions: { title: string; requirements: string }[];
  uiElectionId?: string; // optional UI id to map to on-chain id
  walletClient?: GetWalletClientReturnType;
  chainId?: number;
}) {
  if (!payload.contract || !isValidAddress(payload.contract)) {
    throw new Error("Invalid contract address");
  }
  if (!payload.title || typeof payload.title !== "string") {
    throw new Error("Invalid title");
  }
  if (!Array.isArray(payload.positions) || payload.positions.length === 0) {
    throw new Error("At least one position is required");
  }

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || payload.chainId || 84532);

  // Convert times to bigint because voting-service expects bigint
  const startTime = BigInt(Math.floor(payload.startTime));
  const endTime = BigInt(Math.floor(payload.endTime));

  // Prepare positions in the shape expected by createElection in voting-service
  const mappedPositions = payload.positions.map((p, idx) => ({
    id: BigInt(0), // contract will assign id on-chain
    title: p.title,
    requirements: p.requirements,
  }));

  // Use provided wallet client or attempt to obtain one
  const client = await ensureWalletClient(chainId, payload.walletClient);

  // Attempt to estimate gas before sending
  const { address, abi } = UniversityVotingContract(chainId);
  const estimatedGas = await tryEstimateGas({
    chainId,
    address,
    abi,
    functionName: "createElection",
    args: [payload.title, payload.description, startTime, endTime, mappedPositions],
  });

  try {
    // Call underlying voting-service createElection (which will perform the write and wait for receipt)
    const result = await vcCreateElection(
      chainId,
      client,
      payload.title,
      payload.description,
      startTime,
      endTime,
      payload.positions
    );

    // Try to determine on-chain election id from receipt
    const onchainId = parseOnchainIdFromReceipt(result.receipt) ?? 0n;

    // Create or derive a UI election id if not provided
    const uiId = payload.uiElectionId ?? `ui_${Date.now()}`;

    // Add mapping (best-effort). Note: on server-side persistence may be limited.
    try {
      addElectionMapping(uiId, onchainId);
      // For positions, we do not know on-chain position IDs reliably here.
      // We still add placeholder mappings so UI can be aware of the created relation.
      for (let i = 0; i < payload.positions.length; i++) {
        const uiPosId = `${uiId}_pos_${i}`;
        // if onchainId is zero, still add mapping with 0n placeholder
        addPositionMapping(uiPosId, 0n);
      }
    } catch {
      // mapping persistence is best-effort; ignore mapping errors
    }

    return {
      hash: result.hash,
      receipt: result.receipt,
      estimatedGas,
      uiId,
      onchainId,
    };
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : "Unknown error while creating election";
    throw new Error(`Failed to create election: ${message}`);
  }
}

/**
 * Verify candidate as admin by calling voting-service.verifyCandidate
 * Returns tx hash + receipt and attempts to add a candidate mapping if a UI id is supplied.
 */
export async function verifyCandidateAsAdmin(payload: {
  contract: string;
  electionId: number;
  candidateId: number;
  uiCandidateId?: string;
  walletClient?: GetWalletClientReturnType;
  chainId?: number;
}) {
  if (!payload.contract || !isValidAddress(payload.contract)) {
    throw new Error("Invalid contract address");
  }
  if (!Number.isFinite(payload.electionId) || payload.electionId < 0) {
    throw new Error("Invalid electionId; must be a non-negative integer");
  }
  if (!Number.isFinite(payload.candidateId) || payload.candidateId < 0) {
    throw new Error("Invalid candidateId; must be a non-negative integer");
  }

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || payload.chainId || 84532);
  const client = await ensureWalletClient(chainId, payload.walletClient);

  // Estimate gas (best-effort)
  const { address, abi } = UniversityVotingContract(chainId);
  const estimatedGas = await tryEstimateGas({
    chainId,
    address,
    abi,
    functionName: "verifyCandidate",
    args: [BigInt(payload.electionId), BigInt(payload.candidateId)],
  });

  try {
    const result = await vcVerifyCandidate(
      chainId,
      client,
      BigInt(payload.electionId),
      BigInt(payload.candidateId)
    );

    // Attempt to add candidate mapping if uiCandidateId provided
    if (payload.uiCandidateId) {
      try {
        addCandidateMapping(payload.uiCandidateId, BigInt(payload.candidateId));
      } catch {
        // ignore mapping errors
      }
    }

    return {
      hash: result.hash,
      receipt: result.receipt,
      estimatedGas,
    };
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : "Unknown error while verifying candidate";
    throw new Error(`Failed to verify candidate: ${message}`);
  }
}

/**
 * Add candidate (used by admins/students) — helper that uses voting-service.addCandidate,
 * returns tx hash and receipt and attempts to register an ID mapping.
 */
export async function addCandidateAsAdmin(payload: {
  contract: string;
  electionId: number;
  positionId: number;
  studentWallet: string;
  name: string;
  uiCandidateId?: string;
  walletClient?: GetWalletClientReturnType;
  chainId?: number;
}) {
  if (!payload.contract || !isValidAddress(payload.contract)) {
    throw new Error("Invalid contract address");
  }
  if (!Number.isFinite(payload.electionId) || payload.electionId < 0) {
    throw new Error("Invalid electionId; must be a non-negative integer");
  }
  if (!Number.isFinite(payload.positionId) || payload.positionId < 0) {
    throw new Error("Invalid positionId; must be a non-negative integer");
  }
  if (!isValidAddress(payload.studentWallet)) {
    throw new Error("Invalid student wallet address");
  }
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || payload.chainId || 84532);
  const client = await ensureWalletClient(chainId, payload.walletClient);

  // Estimate gas (best-effort)
  const { address, abi } = UniversityVotingContract(chainId);
  const estimatedGas = await tryEstimateGas({
    chainId,
    address,
    abi,
    functionName: "addCandidate",
    args: [BigInt(payload.electionId), BigInt(payload.positionId), payload.studentWallet, payload.name],
  });

  try {
    const result = await vcAddCandidate(
      chainId,
      client,
      BigInt(payload.electionId),
      BigInt(payload.positionId),
      payload.studentWallet as `0x${string}`,
      payload.name
    );

    // Try to parse candidate id from receipt if present
    const onchainCandidateId = parseOnchainIdFromReceipt(result.receipt) ?? BigInt(0);

    // Add candidate mapping if uiCandidateId provided or generate one
    const uiCandidateId = payload.uiCandidateId ?? `ui_cand_${Date.now()}`;
    try {
      addCandidateMapping(uiCandidateId, onchainCandidateId);
    } catch {
      // ignore mapping errors
    }

    return {
      hash: result.hash,
      receipt: result.receipt,
      estimatedGas,
      uiCandidateId,
      onchainCandidateId,
    };
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : "Unknown error while adding candidate";
    throw new Error(`Failed to add candidate: ${message}`);
  }
}

/**
 * Cast a vote using voting-service.castVote.
 * Returns tx hash + receipt and an estimated gas if available.
 */
export async function castVoteAsVoter(payload: {
  contract: string;
  electionId: number;
  positionId: number;
  candidateId: number;
  walletClient?: GetWalletClientReturnType;
  chainId?: number;
}) {
  if (!payload.contract || !isValidAddress(payload.contract)) {
    throw new Error("Invalid contract address");
  }
  if (!Number.isFinite(payload.electionId) || payload.electionId < 0) {
    throw new Error("Invalid electionId; must be a non-negative integer");
  }
  if (!Number.isFinite(payload.positionId) || payload.positionId < 0) {
    throw new Error("Invalid positionId; must be a non-negative integer");
  }
  if (!Number.isFinite(payload.candidateId) || payload.candidateId < 0) {
    throw new Error("Invalid candidateId; must be a non-negative integer");
  }

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || payload.chainId || 84532);
  const client = await ensureWalletClient(chainId, payload.walletClient);

  // Estimate gas (best-effort)
  const { address, abi } = UniversityVotingContract(chainId);
  const estimatedGas = await tryEstimateGas({
    chainId,
    address,
    abi,
    functionName: "castVote",
    args: [BigInt(payload.electionId), BigInt(payload.positionId), BigInt(payload.candidateId)],
  });

  try {
    const result = await vcCastVote(
      chainId,
      client,
      BigInt(payload.electionId),
      BigInt(payload.positionId),
      BigInt(payload.candidateId)
    );

    return {
      hash: result.hash,
      receipt: result.receipt,
      estimatedGas,
    };
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : "Unknown error while casting vote";
    throw new Error(`Failed to cast vote: ${message}`);
  }
}

export async function verifyStudentEligibilityOffchain(matricNumber: string) {
  // Placeholder for real eligibility checks; returns boolean for now
  return Boolean(matricNumber && matricNumber.startsWith("TU"));
}