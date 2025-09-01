import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCandidateAsAdmin } from "@/lib/blockchain/thirdweb-service";
import { recoverMessageAddress } from "viem";

const BodySchema = z.object({
  contract: z.string().startsWith("0x"),
  electionId: z.number().int().nonnegative(),
  candidateId: z.number().int().nonnegative(),
  signature: z.string(),
  timestamp: z.number().int().nonnegative(),
  uiCandidateId: z.string().optional(),
});

/**
 * Expected signed message format:
 * "VerifyCandidate:{contract}:{electionId}:{candidateId}:{timestamp}"
 *
 * The client MUST sign exactly the string above and include the signature and timestamp.
 * The server will verify the signature recovers the configured ADMIN_WALLET_ADDRESS and
 * that the timestamp is recent (within 5 minutes) to mitigate replay attacks.
 */

const TIMESTAMP_WINDOW_SECONDS = 60 * 5; // 5 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);

    const adminWallet = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
      process.env.ADMIN_WALLET_ADDRESS ||
      "").toString();

    if (!adminWallet) {
      return NextResponse.json({ error: "Admin wallet not configured on server" }, { status: 500 });
    }

    // Validate timestamp freshness
    const nowSec = Math.floor(Date.now() / 1000);
    const ts = Number(parsed.timestamp);
    if (!Number.isFinite(ts) || ts <= 0) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
    }
    if (Math.abs(nowSec - ts) > TIMESTAMP_WINDOW_SECONDS) {
      return NextResponse.json({ error: "Stale timestamp; signature expired" }, { status: 401 });
    }

    // Recreate the expected message and recover address from signature
    const message = `VerifyCandidate:${parsed.contract}:${parsed.electionId}:${parsed.candidateId}:${parsed.timestamp}`;

    let recoveredAddress: `0x${string}` | null = null;
    try {
      // recoverMessage from viem expects { message, signature }
      // It will return the recovered address (checksumed) on success.
      // If this call throws, signature is invalid.
      // We coerce to lowercase for comparison.
      // Note: viem.recoverMessage accepts string message; if your client signs differently
      // (e.g. with hex or prefix), ensure the client signs exactly this string.
      recoveredAddress = (await recoverMessageAddress({
        message,
        signature: parsed.signature,
      })) as `0x${string}`;
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid signature or recovery failed" }, { status: 401 });
    }

    if (!recoveredAddress) {
      return NextResponse.json({ error: "Could not recover address from signature" }, { status: 401 });
    }

    if (recoveredAddress.toLowerCase() !== adminWallet.toLowerCase()) {
      return NextResponse.json({ error: "Signature does not match configured admin wallet" }, { status: 401 });
    }

    // Authenticated as admin -> proceed to verify candidate using blockchain service.
    try {
      const servicePayload: {
        contract: string;
        electionId: number;
        candidateId: number;
        uiCandidateId?: string;
        // walletClient omitted on purpose; service will attempt to use configured wallet client if available
      } = {
        contract: parsed.contract,
        electionId: parsed.electionId,
        candidateId: parsed.candidateId,
      };
      if (parsed.uiCandidateId) servicePayload.uiCandidateId = parsed.uiCandidateId;

      const result = await verifyCandidateAsAdmin({
        contract: servicePayload.contract,
        electionId: servicePayload.electionId,
        candidateId: servicePayload.candidateId,
        uiCandidateId: servicePayload.uiCandidateId,
      });

      // Normalize response shape for frontend: include hash, receipt (if any), estimatedGas
      const responsePayload = {
        success: true,
        hash: result?.hash ?? null,
        receipt: result?.receipt ?? null,
        estimatedGas: result?.estimatedGas ?? null,
      };

      return NextResponse.json(responsePayload, { status: 200 });
    } catch (err: any) {
      // service-level failure: capture and return helpful message
      const message = err && err.message ? String(err.message) : "Unknown error while verifying candidate";
      // If it's likely a server-wallet configuration issue, return 502 to indicate bad gateway to blockchain
      const status = message.toLowerCase().includes("wallet client") || message.toLowerCase().includes("failed to obtain")
        ? 502
        : 500;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (err: any) {
    // zod or JSON parsing errors or unexpected errors
    const msg = err && err.message ? String(err.message) : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}