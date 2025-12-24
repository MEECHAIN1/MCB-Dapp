import React from 'react';
import { useAppState } from '../context/AppState';
import { Address, formatUnits } from 'viem';
import { getStakedNFTs, getRewardRate, getEarned, stakeNft, unstakeNft, claimRewards } from '../../lib/services/staking';
import { fetchNftMetadata, getNftBalance, approveNft, getApproved } from '../../lib/services/nft';
import { getTokenDecimals } from '../../lib/services/token';
import { NFTMetadata } from '../../types';
import { ADRS } from '../../lib/contracts';
import JSConfetti from 'js-confetti';

const StakingPage: React.FC = () => {
  const {
    account,
    isConnected,
    stakingBalance,
    rewardRate,
    setStakingBalance,
    setRewardRate,
    addEvent, // Changed from addEventLog
    setLoading, // Changed from setIsLoading
    setError,
    loading, // Changed from isLoading
    error, 
    nftBalance: userNftBalance, // Get user's total NFT balance to show available for staking
  } = useAppState();
  const walletClient = undefined;
  const chain = { id: undefined, name: undefined } as any;

  const [availableNfts, setAvailableNfts] = React.useState<NFTMetadata[]>([]);
  const [stakedNfts, setStakedNfts] = React.useState<NFTMetadata[]>([]);
  const [earnedRewards, setEarnedRewards] = React.useState<bigint>(0n);
  const [tokenDecimals, setTokenDecimals] = React.useState<number>(18);
  const [stakeInputId, setStakeInputId] = React.useState<string>('');
  const [unstakeInputId, setUnstakeInputId] = React.useState<string>('');
  const [approving, setApproving] = React.useState(false);
  const [staking, setStaking] = React.useState(false);
  const [unstaking, setUnstaking] = React.useState(false);
  const [claiming, setClaiming] = React.useState(false);

  const jsConfetti = React.useMemo(() => new JSConfetti(), []);

  const fetchStakingData = React.useCallback(async () => {
    if (!account || !isConnected || !chain) {
      setAvailableNfts([]);
      setStakedNfts([]);
      setEarnedRewards(0n);
      setStakingBalance("0");
      setRewardRate("0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const decimals = await getTokenDecimals();
      setTokenDecimals(decimals);

      const [stakedIds, rewardRateBigInt, earned] = await Promise.all([
        getStakedNFTs(account),
        getRewardRate(),
        getEarned(account),
      ]);

      setStakingBalance(stakedIds.length.toString()); // Convert number to string
      setRewardRate(formatUnits(rewardRateBigInt, decimals)); // Format bigint to string
      setEarnedRewards(earned);

      const fetchedStakedNfts = await Promise.all(
        stakedIds.map(async (id) => {
          const metadata = await fetchNftMetadata(id);
          return metadata;
        })
      );
      setStakedNfts(fetchedStakedNfts.filter((nft): nft is NFTMetadata => nft !== undefined));

      // Fetch available NFTs (owned by user and not staked)
      // This is a simplified logic. In a real app, `tokenOfOwnerByIndex` or a subgraph would be used.
      const userOwnedNftCount = await getNftBalance(account);
      const ownedNfts: NFTMetadata[] = [];
      const MAX_FAKE_NFTS = 10; // Limit for simulation
      for (let i = 0; i < Math.min(Number(userOwnedNftCount), MAX_FAKE_NFTS); i++) {
        // Assuming token IDs start from 1 for simplicity in this scaffold
        const dummyTokenId = BigInt(i + 1);
        const nftData = await fetchNftMetadata(dummyTokenId);
        if (nftData && nftData.owner === account && !stakedIds.some(stakedId => stakedId === nftData.tokenId)) {
          ownedNfts.push(nftData);
        }
      }
      setAvailableNfts(ownedNfts);


    } catch (e: any) {
      console.error("Error fetching staking data:", e);
      setError(`Failed to fetch staking data: ${e.shortMessage || e.message}`);
    } finally {
      setLoading(false);
    }
  }, [account, isConnected, chain, setStakingBalance, setRewardRate, setLoading, setError]);

  React.useEffect(() => {
    fetchStakingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStakingData]);

  const handleApprove = async (tokenId: bigint) => {
    if (!walletClient || !account || !ADRS.nft || !ADRS.staking) {
      setError("Wallet not connected or contract addresses missing.");
      return;
    }
    setApproving(true);
    setError(null);
    try {
      const approvedAddress = await getApproved(tokenId);
      if (approvedAddress !== ADRS.staking) {
        const { hash } = await approveNft(walletClient, ADRS.staking, tokenId, account);
        addEvent({ // Changed from addEventLog
          timestamp: new Date().toISOString(),
          contract: 'nft',
          event: 'NFT Approved',
          args: { tokenId: tokenId, approved: ADRS.staking },
          transactionHash: hash,
        });
      }
      await fetchStakingData();
    } catch (e: any) {
      console.error("NFT Approval failed:", e);
      setError(`NFT Approval failed: ${e.shortMessage || e.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleStake = async (tokenId: bigint) => {
    if (!walletClient || !account || !ADRS.staking) {
      setError("Wallet not connected or staking contract missing.");
      return;
    }
    setStaking(true);
    setError(null);
    try {
      // First, check if NFT is approved
      const approvedAddress = await getApproved(tokenId);
      if (approvedAddress !== ADRS.staking) {
        setError("NFT not approved for staking contract. Please approve first.");
        setStaking(false);
        return;
      }

      const { hash } = await stakeNft(walletClient, tokenId, account);
      addEvent({ // Changed from addEventLog
        timestamp: new Date().toISOString(),
        contract: 'staking',
        event: 'NFT Staked',
        args: { tokenId: tokenId },
        transactionHash: hash,
      });
      setStakeInputId('');
      await fetchStakingData();
    } catch (e: any) {
      console.error("Staking failed:", e);
      setError(`Staking failed: ${e.shortMessage || e.message}`);
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (tokenId: bigint) => {
    if (!walletClient || !account || !ADRS.staking) {
      setError("Wallet not connected or staking contract missing.");
      return;
    }
    setUnstaking(true);
    setError(null);
    try {
      const { hash } = await unstakeNft(walletClient, tokenId, account);
      addEvent({ // Changed from addEventLog
        timestamp: new Date().toISOString(),
        contract: 'staking',
        event: 'NFT Unstaked',
        args: { tokenId: tokenId },
        transactionHash: hash,
      });
      setUnstakeInputId('');
      await fetchStakingData();
    } catch (e: any) {
      console.error("Unstaking failed:", e);
      setError(`Unstaking failed: ${e.shortMessage || e.message}`);
    } finally {
      setUnstaking(false);
    }
  };

  const handleClaim = async () => {
    if (!walletClient || !account || !ADRS.staking || earnedRewards === 0n) {
      setError("Wallet not connected, staking contract missing, or no rewards to claim.");
      return;
    }
    setClaiming(true);
    setError(null);
    try {
      const { hash } = await claimRewards(walletClient, account);
      addEvent({ // Changed from addEventLog
        timestamp: new Date().toISOString(),
        contract: 'staking',
        event: 'Rewards Claimed',
        args: { amount: formatUnits(earnedRewards, tokenDecimals) },
        transactionHash: hash,
      });
      jsConfetti.addConfetti({
        confettiColors: [
          '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
        ],
        emojis: ['🎉', '💰', '✨', '🥳'],
        emojiSize: 30,
        confettiNumber: 150,
      });
      await fetchStakingData();
    } catch (e: any) {
      console.error("Claiming failed:", e);
      setError(`Claiming failed: ${e.shortMessage || e.message}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 text-center">MeeBot Staking</h1>

      {loading && <p className="text-blue-400 text-center text-lg mb-4">Loading staking data...</p>}
      {error && ( // Using error from useAppState directly
        <div className="bg-red-700 p-4 rounded-lg text-white mb-6 text-center">
          Error: {error}
        </div>
      )}

      {!isConnected && (
        <p className="text-slate-400 text-center text-lg">Connect your wallet to manage staking.</p>
      )}

      {isConnected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gray-700 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Staked NFTs</h3>
              <p className="text-4xl font-bold text-emerald-400">
                {stakingBalance} <span className="text-lg font-medium text-slate-300">NFTs</span>
              </p>
            </div>
            <div className="p-6 bg-gray-700 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Reward Rate</h3>
              <p className="text-4xl font-bold text-yellow-400">
                {parseFloat(rewardRate).toFixed(4)}{' '}
                <span className="text-lg font-medium text-slate-300">MTK/NFT/Block</span>
              </p>
            </div>
            <div className="p-6 bg-gray-700 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Earned Rewards</h3>
              <p className="text-4xl font-bold text-purple-400">
                {parseFloat(formatUnits(earnedRewards, tokenDecimals)).toFixed(4)}{' '}
                <span className="text-lg font-medium text-slate-300">MTK</span>
              </p>
              <button
                onClick={handleClaim}
                disabled={claiming || earnedRewards === 0n || !walletClient}
                className="mt-4 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Available NFTs to Stake</h2>
              {availableNfts.length === 0 ? (
                <p className="text-slate-400">You have no MeeBot NFTs available to stake. Buy some or check your staked gallery.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableNfts.map((nft) => (
                    <div key={nft.tokenId.toString()} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                      <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-slate-200">{nft.name}</h3>
                        <p className="text-sm text-slate-400">ID: {nft.tokenId.toString()}</p>
                      </div>
                      <button
                        onClick={() => handleStake(nft.tokenId)}
                        disabled={staking || !walletClient || approving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {staking ? 'Staking...' : 'Stake'}
                      </button>
                      <button
                        onClick={() => handleApprove(nft.tokenId)}
                        disabled={approving || !walletClient}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approving ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Staked NFTs</h2>
              {stakedNfts.length === 0 ? (
                <p className="text-slate-400">You have no MeeBot NFTs currently staked.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stakedNfts.map((nft) => (
                    <div key={nft.tokenId.toString()} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                      <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-slate-200">{nft.name}</h3>
                        <p className="text-sm text-slate-400">ID: {nft.tokenId.toString()}</p>
                      </div>
                      <button
                        onClick={() => handleUnstake(nft.tokenId)}
                        disabled={unstaking || !walletClient}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {unstaking ? 'Unstaking...' : 'Unstake'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StakingPage;