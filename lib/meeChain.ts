import { type Chain } from 'viem';

export const meeChain = {
	id: 1337,
	name: 'MeeChain',
	nativeCurrency: {
		decimals: 18,
		name: 'MeeCoin',
		symbol: 'MEC',
	},
	rpcUrls: {
		default: { http: ['https://meechain.run.place'] }, 
	},
	blockExplorers: {
		default: { name: 'MeeScan', url: 'https://meechain.bolt.host' },
	},
	testnet: false,
} as const satisfies Chain