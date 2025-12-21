// src/services/chainFacts.ts
import { createPublicClient, http, formatUnits } from "viem";
import { getAccount } from "@wagmi/core";
import { ADRS, ABIS } from "@/lib/contracts";

export async function getUserChainFacts(rpcUrl: string) {
  const { address } = getAccount();
  const client = createPublicClient({ transport: http(rpcUrl) });

  let tokenBalance = "0";
  let nftCount = 0;
  let earnedMCB = "0";

  if (!address) return null;

  try {
    const [tBal, nBal, earned] = await Promise.all([
      client.readContract({ address: ADRS.token as `0x${string}`, abi: ABIS.token, functionName: "balanceOf", args: [address] }),
      client.readContract({ address: ADRS.nft as `0x${string}`, abi: ABIS.nft, functionName: "balanceOf", args: [address] }),
      client.readContract({ address: ADRS.staking as `0x${string}`, abi: ABIS.staking, functionName: "earned", args: [address] }),
    ]);

    tokenBalance = formatUnits(tBal as bigint, 18);
    nftCount = Number(nBal);
    earnedMCB = formatUnits(earned as bigint, 18);
  } catch (err) {
    console.error("Failed to fetch ritual metrics", err);
  }

  return { address, tokenBalance, nftCount, earnedMCB, timestamp: Date.now() };
}