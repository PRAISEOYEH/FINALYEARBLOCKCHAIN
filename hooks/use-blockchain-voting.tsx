"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getCandidate,
  getElection,
  hasVoted as hasVotedOnchain,
  castVote as castVoteOnchain,
  createElection as createElectionOnchain,
  addCandidate as addCandidateOnchain,
  verifyCandidate as verifyCandidateOnchain,
  onVoteCast,
  UniversityVotingContract,
} from "@/lib/blockchain/voting-service";
import { baseSepolia } from "wagmi/chains";
import { useWalletClient } from "wagmi";
import { useMultiWallet } from "./use-multi-wallet";

const CHAIN_ID = baseSepolia.id;

type TxStatus = "pending" | "confirmed" | "failed";

interface TxInfo {
  id: string; // either hash or temporary id
  status: TxStatus;
  hash?: string;
  receipt?: any;
  error?: any;
  createdAt: number;
  updatedAt: number;
}

export function useBlockchainVoting() {
  const qc = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const wallet = useMultiWallet();
  const [txs, setTxs] = useState<Record<string, TxInfo>>({});

  // Destructure wallet state for validation
  const { isConnected, isOnSupportedNetwork, account } = wallet;

  // Enhanced wallet validation for blockchain operations
  const validateWalletForBlockchainOp = () => {
    if (!isConnected) {
      throw new Error('WALLET_NOT_CONNECTED');
    }
    if (!isOnSupportedNetwork) {
      throw new Error('WRONG_NETWORK');
    }
    if (!walletClient) {
      throw new Error('WALLET_CLIENT_NOT_READY');
    }
    if (!account) {
      throw new Error('NO_ACCOUNT_ADDRESS');
    }
  };

  // helper to safely update tx state
  const setTx = (id: string, patch: Partial<TxInfo>) => {
    setTxs((prev) => {
      const existing = prev[id];
      const updated: TxInfo = {
        id,
        status: existing?.status ?? "pending",
        hash: existing?.hash,
        receipt: existing?.receipt,
        error: existing?.error,
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        ...patch,
      };
      return { ...prev, [id]: updated };
    });
  };

  // Utility to fetch with React Query caching for reads
  const cachedGetElection = async (electionId: bigint) => {
    return qc.fetchQuery(["election", String(electionId)], () => getElection(CHAIN_ID, electionId), {
      // options: staleTime and retries handled by fetchQuery
    });
  };

  const cachedGetCandidate = async (electionId: bigint, candidateId: bigint) => {
    return qc.fetchQuery(
      ["candidate", String(electionId), String(candidateId)],
      () => getCandidate(CHAIN_ID, electionId, candidateId)
    );
  };

  const cachedHasVoted = async (voter: `0x${string}`, electionId: bigint, positionId: bigint) => {
    return qc.fetchQuery(
      ["hasVoted", voter, String(electionId), String(positionId)],
      () => hasVotedOnchain(CHAIN_ID, voter, electionId, positionId),
      { retry: 1 }
    );
  };

  // CAST VOTE mutation
  const castVoteMutation = useMutation({
    mutationFn: async (vars: { electionId: bigint; positionId: bigint; candidateId: bigint }) => {
      // Enhanced wallet validation
      validateWalletForBlockchainOp();

      // create a temporary tx id so UI can show pending immediately
      const tempId = `pending-${Date.now()}`;
      setTx(tempId, { id: tempId, status: "pending" });

      try {
        // Attempt gas estimation if walletClient supports it
        try {
          const { address, abi } = UniversityVotingContract(CHAIN_ID);
          if ((walletClient as any).estimateContractGas) {
            // best-effort estimation
            await (walletClient as any).estimateContractGas({
              address,
              abi,
              functionName: "castVote",
              args: [vars.electionId, vars.positionId, vars.candidateId],
            });
          }
        } catch (estErr) {
          // ignore estimation errors, continue to submit
        }

        const result = await castVoteOnchain(CHAIN_ID, walletClient, vars.electionId, vars.positionId, vars.candidateId);
        // result likely includes { hash, receipt }
        const hash = (result && (result as any).hash) || `hash-${Date.now()}`;
        const receipt = (result && (result as any).receipt) || null;

        // set confirmed with hash and receipt
        setTx(hash, { id: hash, status: receipt ? "confirmed" : "confirmed", hash, receipt });
        // remove temp entry
        setTxs((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });

        // invalidate relevant caches
        qc.invalidateQueries(); // broad invalidation
        return { hash, receipt };
      } catch (err) {
        // mark temp as failed
        setTx(tempId, { status: "failed", error: err });
        throw err;
      }
    },
    onSuccess: () => {
      // ensure queries are up-to-date
      qc.invalidateQueries();
    },
    onError: () => {
      // leave the tx state as failed
    },
    retry: 1,
  });

  // ADMIN: createElection
  const createElectionMutation = useMutation({
    mutationFn: async (vars: {
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      positions: { title: string; requirements: string }[];
    }) => {
      // Enhanced wallet validation
      validateWalletForBlockchainOp();

      const tempId = `pending-create-${Date.now()}`;
      setTx(tempId, { id: tempId, status: "pending" });

      try {
        // estimate gas if supported
        try {
          const { address, abi } = UniversityVotingContract(CHAIN_ID);
          if ((walletClient as any).estimateContractGas) {
            await (walletClient as any).estimateContractGas({
              address,
              abi,
              functionName: "createElection",
              args: [vars.title, vars.description, vars.startTime, vars.endTime, vars.positions],
            });
          }
        } catch (estErr) {
          // ignore estimation errors
        }

        const result = await createElectionOnchain(
          CHAIN_ID,
          walletClient,
          vars.title,
          vars.description,
          vars.startTime,
          vars.endTime,
          vars.positions
        );

        const hash = (result && (result as any).hash) || `hash-${Date.now()}`;
        const receipt = (result && (result as any).receipt) || null;

        setTx(hash, { id: hash, status: receipt ? "confirmed" : "confirmed", hash, receipt });
        setTxs((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });

        qc.invalidateQueries();
        return { hash, receipt };
      } catch (err) {
        setTx(tempId, { status: "failed", error: err });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries(),
    retry: 2,
  });

  // ADMIN: addCandidate
  const addCandidateMutation = useMutation({
    mutationFn: async (vars: {
      electionId: bigint;
      positionId: bigint;
      studentWallet: `0x${string}`;
      name: string;
    }) => {
      // Enhanced wallet validation
      validateWalletForBlockchainOp();

      const tempId = `pending-addCandidate-${Date.now()}`;
      setTx(tempId, { id: tempId, status: "pending" });

      try {
        // estimate gas if supported
        try {
          const { address, abi } = UniversityVotingContract(CHAIN_ID);
          if ((walletClient as any).estimateContractGas) {
            await (walletClient as any).estimateContractGas({
              address,
              abi,
              functionName: "addCandidate",
              args: [vars.electionId, vars.positionId, vars.studentWallet, vars.name],
            });
          }
        } catch (estErr) {
          // ignore estimation errors
        }

        const result = await addCandidateOnchain(
          CHAIN_ID,
          walletClient,
          vars.electionId,
          vars.positionId,
          vars.studentWallet,
          vars.name
        );

        const hash = (result && (result as any).hash) || `hash-${Date.now()}`;
        const receipt = (result && (result as any).receipt) || null;

        setTx(hash, { id: hash, status: receipt ? "confirmed" : "confirmed", hash, receipt });
        setTxs((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });

        qc.invalidateQueries();
        return { hash, receipt };
      } catch (err) {
        setTx(tempId, { status: "failed", error: err });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries(),
    retry: 2,
  });

  // ADMIN: verifyCandidate
  const verifyCandidateMutation = useMutation({
    mutationFn: async (vars: { electionId: bigint; candidateId: bigint }) => {
      // Enhanced wallet validation
      validateWalletForBlockchainOp();

      const tempId = `pending-verify-${Date.now()}`;
      setTx(tempId, { id: tempId, status: "pending" });

      try {
        // estimate gas if supported
        try {
          const { address, abi } = UniversityVotingContract(CHAIN_ID);
          if ((walletClient as any).estimateContractGas) {
            await (walletClient as any).estimateContractGas({
              address,
              abi,
              functionName: "verifyCandidate",
              args: [vars.electionId, vars.candidateId],
            });
          }
        } catch (estErr) {
          // ignore estimation errors
        }

        const result = await verifyCandidateOnchain(CHAIN_ID, walletClient, vars.electionId, vars.candidateId);

        const hash = (result && (result as any).hash) || `hash-${Date.now()}`;
        const receipt = (result && (result as any).receipt) || null;

        setTx(hash, { id: hash, status: receipt ? "confirmed" : "confirmed", hash, receipt });
        setTxs((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });

        qc.invalidateQueries();
        return { hash, receipt };
      } catch (err) {
        setTx(tempId, { status: "failed", error: err });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries(),
    retry: 2,
  });

  // Subscribe to VoteCast events for real-time updates
  useEffect(() => {
    let unsub: any;
    try {
      const handler = (log: any) => {
        // logs can come in various shapes depending on the client
        // try to extract electionId, positionId, candidateId
        try {
          let electionId: bigint | null = null;
          let positionId: bigint | null = null;
          let candidateId: bigint | null = null;

          const args = log?.args ?? log?.decoded ?? null;

          if (args) {
            if (Array.isArray(args)) {
              // array-style args
              electionId = args[0] != null ? BigInt(args[0].toString?.() ?? args[0]) : null;
              positionId = args[1] != null ? BigInt(args[1].toString?.() ?? args[1]) : null;
              candidateId = args[2] != null ? BigInt(args[2].toString?.() ?? args[2]) : null;
            } else {
              // object-style args
              const tryVal = (v: any) => (v != null ? BigInt(v.toString?.() ?? v) : null);
              electionId = tryVal(args.electionId ?? args._electionId ?? args[0]);
              positionId = tryVal(args.positionId ?? args._positionId ?? args[1]);
              candidateId = tryVal(args.candidateId ?? args._candidateId ?? args[2]);
            }
          } else if (log?.data) {
            // fallback: cannot decode here, do a full refetch
          }

          // Invalidate specific queries when we have ids
          if (electionId) {
            qc.invalidateQueries(["election", String(electionId)]);
          }
          if (electionId && candidateId) {
            qc.invalidateQueries(["candidate", String(electionId), String(candidateId)]);
          }

          // Always trigger a broader refresh of lists/counts
          qc.invalidateQueries(["elections"]);
          qc.invalidateQueries(["candidates"]);
        } catch (err) {
          // if parsing fails, fallback to broad invalidation
          qc.invalidateQueries();
        }
      };

      const maybeUnsub = onVoteCast(CHAIN_ID, handler);
      // The watcher may return an unsubscribe function or an object. Support both.
      if (typeof maybeUnsub === "function") {
        unsub = maybeUnsub;
      } else if (maybeUnsub && typeof maybeUnsub.unsubscribe === "function") {
        unsub = () => maybeUnsub.unsubscribe();
      } else if (maybeUnsub && typeof maybeUnsub.stop === "function") {
        unsub = () => maybeUnsub.stop();
      } else {
        // If the watcher doesn't give us a way to unsubscribe, leave unsub undefined.
        unsub = undefined;
      }
    } catch (err) {
      // if setting up watcher fails, don't crash the app
      console.error("Failed to subscribe to VoteCast events:", err);
    }

    return () => {
      try {
        if (unsub) unsub();
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);

  // Public API exposed by the hook
  const api = useMemo(
    () => ({
      // Read helpers that leverage the React Query cache
      getElection: (electionId: bigint) => cachedGetElection(electionId),
      getCandidate: (electionId: bigint, candidateId: bigint) => cachedGetCandidate(electionId, candidateId),
      hasVoted: (voter: `0x${string}`, electionId: bigint, positionId: bigint) =>
        cachedHasVoted(voter, electionId, positionId),

      // Write actions
      castVote: (electionId: bigint, positionId: bigint, candidateId: bigint) =>
        castVoteMutation.mutateAsync({ electionId, positionId, candidateId }),

      // Admin actions
      createElection: (title: string, description: string, startTime: bigint, endTime: bigint, positions: { title: string; requirements: string }[]) =>
        createElectionMutation.mutateAsync({ title, description, startTime, endTime, positions }),
      addCandidate: (electionId: bigint, positionId: bigint, studentWallet: `0x${string}`, name: string) =>
        addCandidateMutation.mutateAsync({ electionId, positionId, studentWallet, name }),
      verifyCandidate: (electionId: bigint, candidateId: bigint) =>
        verifyCandidateMutation.mutateAsync({ electionId, candidateId }),

      // Query states
      isReady: Boolean(walletClient && isConnected && isOnSupportedNetwork),

      // Wallet state information
      walletState: {
        isConnected,
        isOnSupportedNetwork,
        account,
      },
      needsNetworkSwitch: !isOnSupportedNetwork && isConnected,

      // Transaction state helpers
      listTransactions: () => Object.values(txs).sort((a, b) => b.createdAt - a.createdAt),
      getTransaction: (idOrHash: string) => txs[idOrHash] ?? null,
      // flags for common operations
      isCasting: castVoteMutation.isPending,
      isCreatingElection: createElectionMutation.isPending,
      isAddingCandidate: addCandidateMutation.isPending,
      isVerifyingCandidate: verifyCandidateMutation.isPending,
    }),
    [
      walletClient,
      isConnected,
      isOnSupportedNetwork,
      account,
      castVoteMutation.isPending,
      createElectionMutation.isPending,
      addCandidateMutation.isPending,
      verifyCandidateMutation.isPending,
      txs,
    ]
  );

  return api;
}