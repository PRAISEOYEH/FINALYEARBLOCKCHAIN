"use client";

import { useAccount, useReadContract, useWriteContract, useChainId } from "wagmi";
import { VotingAbi } from "@/lib/abi/Voting";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS as `0x${string}` | undefined;

export function useOnchainVoting() {
  const { address: user } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();

  const getResults = (pollId: bigint) =>
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VotingAbi,
      functionName: "getPollResults",
      args: [pollId],
      query: { enabled: Boolean(CONTRACT_ADDRESS) },
    });

  const whitelistVoter = async (voter: `0x${string}`) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address missing");
    return writeContractAsync({ address: CONTRACT_ADDRESS, abi: VotingAbi, functionName: "whitelistVoter", args: [voter] });
  };

  const createPoll = async (question: string, options: string[], durationSeconds: bigint) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address missing");
    return writeContractAsync({ address: CONTRACT_ADDRESS, abi: VotingAbi, functionName: "createPoll", args: [question, options, durationSeconds] });
  };

  const vote = async (pollId: bigint, option: bigint) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address missing");
    return writeContractAsync({ address: CONTRACT_ADDRESS, abi: VotingAbi, functionName: "vote", args: [pollId, option] });
  };

  const endPoll = async (pollId: bigint) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address missing");
    return writeContractAsync({ address: CONTRACT_ADDRESS, abi: VotingAbi, functionName: "endPoll", args: [pollId] });
  };

  return { user, chainId, isPending, getResults, whitelistVoter, createPoll, vote, endPoll };
}
