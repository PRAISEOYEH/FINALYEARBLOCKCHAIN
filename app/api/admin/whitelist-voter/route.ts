import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { whitelistVoter } from "@/lib/blockchain/thirdweb-service";
import { utils as ethersUtils } from "ethers";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

const BodySchema = z.object({
  contract: z.string().regex(addressRegex, "Invalid contract address"),
  electionId: z.number().int().nonnegative(),
  voters: z.array(z.string().regex(addressRegex, "Invalid voter address")).min(1),
});

function normalizeAddress(addr?: string | null) {
  if (!addr || typeof addr !== "string") return null;
  return addr.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    // Ensure admin wallet is configured on server
    const configuredAdmin = normalizeAddress(
      process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || process.env.ADMIN_WALLET_ADDRESS || null
    );
    if (!configuredAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: admin wallet not configured on server" },
        { status: 401 }
      );
    }

    // Parse body + validate schema
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = BodySchema.parse(body);

    // Validate headers for admin signature verification
    const sig = req.headers.get("x-admin-signature") || "";
    const signerHeader = normalizeAddress(req.headers.get("x-admin-address") || "");
    const tsHeader = req.headers.get("x-admin-ts") || "";

    if (!sig) {
      return NextResponse.json({ error: "Missing admin signature header (x-admin-signature)" }, { status: 401 });
    }
    if (!signerHeader) {
      return NextResponse.json({ error: "Missing signer address header (x-admin-address)" }, { status: 401 });
    }
    // Signer header must match configured admin address
    if (signerHeader !== configuredAdmin) {
      return NextResponse.json({ error: "Unauthorized: signer address does not match configured admin" }, { status: 401 });
    }

    // Timestamp validation to mitigate replay attacks (5 minutes window)
    const ts = Number(tsHeader || "0");
    if (!ts || Number.isNaN(ts)) {
      return NextResponse.json({ error: "Missing or invalid timestamp header (x-admin-ts)" }, { status: 400 });
    }
    const now = Date.now();
    const allowedDriftMs = 5 * 60 * 1000; // 5 minutes
    if (Math.abs(now - ts) > allowedDriftMs) {
      return NextResponse.json({ error: "Timestamp outside allowed window" }, { status: 401 });
    }

    // Construct a canonical message to verify signature against.
    // Using a stable serialization to avoid ambiguity.
    const messagePayload = {
      action: "WhitelistVoters",
      contract: parsed.contract,
      electionId: parsed.electionId,
      voters: parsed.voters,
      ts,
    };
    const message = JSON.stringify(messagePayload);

    let recovered: string;
    try {
      recovered = ethersUtils.verifyMessage(message, sig);
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid signature format or verification failed" }, { status: 401 });
    }

    if (normalizeAddress(recovered) !== configuredAdmin) {
      return NextResponse.json({ error: "Signature verification failed: signer does not match admin" }, { status: 401 });
    }

    // At this point the request is authenticated as coming from the admin wallet.
    // Proceed to whitelist each voter and collect detailed results for transparency.
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);

    const results: Array<{
      voter: string;
      success: boolean;
      result?: {
        hash?: string;
        receipt?: any;
        estimatedGas?: any;
        message?: string;
      };
      error?: string;
    }> = [];

    for (const v of parsed.voters) {
      if (!v || typeof v !== "string" || !addressRegex.test(v)) {
        results.push({ voter: String(v), success: false, error: "Invalid voter address format" });
        continue;
      }

      try {
        // Call the updated thirdweb-service which integrates with wagmi/viem.
        // Pass chainId explicitly. If the service requires a wallet client on server it will attempt to obtain one.
        const res = await whitelistVoter(parsed.contract, parsed.electionId, v, { chainId });

        // Normalize response for the frontend: include tx hash, receipt summary and estimatedGas if present
        results.push({
          voter: v,
          success: true,
          result: {
            hash: res?.hash ?? null,
            receipt: res?.receipt ?? null,
            estimatedGas: res?.estimatedGas ?? null,
            message: "Whitelisted (pending confirmation or confirmed depending on receipt)",
          },
        });
      } catch (error: any) {
        const msg = error && error.message ? String(error.message) : "Unknown error while whitelisting voter";
        results.push({ voter: v, success: false, error: msg });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount,
        chainId,
        contract: parsed.contract,
        electionId: parsed.electionId,
      },
      results,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      // Return detailed validation errors
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }

    // Generic fallback error
    const message = err && err.message ? String(err.message) : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}