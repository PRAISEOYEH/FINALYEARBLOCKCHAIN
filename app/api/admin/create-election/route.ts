import { NextResponse } from "next/server";
import { z } from "zod";
import { createElectionAsAdmin } from "@/lib/blockchain/thirdweb-service";
import { verifyMessage } from "viem";
import { addElectionMapping } from "@/lib/contracts/id-map";
import fs from "fs/promises";
import path from "path";

const BodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
  positions: z
    .array(z.object({ title: z.string().min(1), requirements: z.string().default("") }))
    .min(1),
  // New fields for admin signature-based authentication
  adminAddress: z.string().optional(),
  signature: z.string().min(1),
  nonce: z.number().int().positive(), // unix timestamp (seconds)
});

function isZeroAddress(addr: string | undefined | null) {
  if (!addr || typeof addr !== "string") return true;
  const normalized = addr.toLowerCase();
  return /^0x0+$/.test(normalized.replace(/^0x/, ""));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);

    // Ensure admin wallet is configured in env
    const ADMIN_WALLET = (process.env.ADMIN_WALLET_ADDRESS || "").toLowerCase();
    if (!ADMIN_WALLET) {
      return NextResponse.json(
        { error: "Server not configured with ADMIN_WALLET_ADDRESS" },
        { status: 500 }
      );
    }

    // Read chain id from env (fallback to 84532)
    const chainIdRaw = process.env.NEXT_PUBLIC_CHAIN_ID;
    const chainId = chainIdRaw ? parseInt(chainIdRaw, 10) : 84532;

    // Map known chain IDs to keys in deployed-addresses.json
    let networkKey: string | null = null;
    if (chainId === 84532) networkKey = "baseSepolia";
    else if (chainId === 31337) networkKey = "localhost";

    if (!networkKey) {
      return NextResponse.json(
        { error: "Contract not deployed for current network (unknown chain id)" },
        { status: 400 }
      );
    }

    const deployedPath = path.join(process.cwd(), "lib", "contracts", "deployed-addresses.json");
    let deployedRaw: string;
    try {
      deployedRaw = await fs.readFile(deployedPath, "utf8");
    } catch (fsErr) {
      return NextResponse.json(
        { error: "Failed to read deployed addresses file" },
        { status: 500 }
      );
    }

    let deployed: any;
    try {
      deployed = JSON.parse(deployedRaw);
    } catch (parseErr) {
      return NextResponse.json({ error: "Invalid deployed addresses JSON" }, { status: 500 });
    }

    const contractAddress =
      deployed?.[networkKey]?.UniversityVoting &&
      typeof deployed[networkKey].UniversityVoting === "string"
        ? deployed[networkKey].UniversityVoting
        : null;

    // Validate contract address exists and isn't the zero address
    if (
      !contractAddress ||
      typeof contractAddress !== "string" ||
      !contractAddress.startsWith("0x") ||
      /^0x0+$/.test(contractAddress.replace(/^0x/, ""))
    ) {
      return NextResponse.json(
        { error: "Contract not deployed for current network" },
        { status: 400 }
      );
    }

    // Verify signature: message includes critical fields and nonce to prevent replay
    const { signature, nonce, adminAddress } = parsed as {
      signature: string;
      nonce: number;
      adminAddress?: string;
    };

    // nonce freshness check (allow +/- 5 minutes)
    const nowSec = Math.floor(Date.now() / 1000);
    const maxSkew = 5 * 60; // 5 minutes
    if (Math.abs(nowSec - nonce) > maxSkew) {
      return NextResponse.json({ error: "Stale nonce" }, { status: 400 });
    }

    // Compose deterministic message to be signed by admin wallet
    // Include contract address and election details to bind the signature to this specific create action
    const messageToSign = [
      "UniversityVoting:CreateElection",
      `contract:${contractAddress}`,
      `title:${parsed.title}`,
      `start:${parsed.startTime}`,
      `end:${parsed.endTime}`,
      `positions:${parsed.positions.length}`,
      `nonce:${nonce}`,
    ].join("|");

    let recovered: string;
    try {
      recovered = (verifyMessage({ message: messageToSign, signature }) || "").toLowerCase();
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
    }

    // If adminAddress provided in body ensure it matches recovered address
    if (adminAddress && adminAddress.toLowerCase() !== recovered) {
      return NextResponse.json(
        { error: "Signature does not match provided admin address" },
        { status: 401 }
      );
    }

    // Ensure recovered address matches configured ADMIN_WALLET_ADDRESS
    if (recovered !== ADMIN_WALLET) {
      return NextResponse.json({ error: "Unauthorized admin" }, { status: 401 });
    }

    // At this point signature is valid and comes from configured admin wallet.
    // Proceed to create election via blockchain service.
    let result: any;
    try {
      result = await createElectionAsAdmin({
        contract: contractAddress,
        title: parsed.title,
        description: parsed.description,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        positions: parsed.positions,
        // We do not pass a walletClient here; the underlying service will attempt to obtain one
      });
    } catch (err: any) {
      // Bubble up detailed blockchain errors with safe message
      const message =
        err && err.message
          ? String(err.message)
          : "Unknown error while creating election on-chain";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // Ensure id mapping persisted for UI (best-effort)
    try {
      // createElectionAsAdmin may already have added mappings, but ensure here as well
      const uiId = result?.uiId ?? `ui_${Date.now()}`;
      const onchainId = result?.onchainId ?? null;
      if (onchainId !== null && onchainId !== undefined) {
        // addElectionMapping expects a string uiId and a bigint onchain id; coerce if needed
        try {
          // Some implementations may return number or bigint; coerce to bigint when possible
          const onchainBigInt =
            typeof onchainId === "bigint" ? onchainId : BigInt(onchainId || 0);
          addElectionMapping(uiId, onchainBigInt);
        } catch {
          // ignore mapping persistence errors (best-effort)
        }
      }
    } catch {
      // ignore mapping errors
    }

    // Normalize the response to include tx info for frontend tracking
    const responsePayload = {
      uiId: result?.uiId ?? null,
      onchainId: result?.onchainId ?? null,
      txHash: result?.hash ?? result?.receipt?.transactionHash ?? null,
      receipt: result?.receipt ?? null,
      estimatedGas: result?.estimatedGas ?? null,
    };

    return NextResponse.json({ success: true, ...responsePayload }, { status: 201 });
  } catch (err: any) {
    // Zod validation errors provide details; surface if available
    if (err && err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request body", details: err.errors }, { status: 400 });
    }

    const message = err && err.message ? String(err.message) : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}