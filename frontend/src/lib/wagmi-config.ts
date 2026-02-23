import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define 0G Galileo Testnet as a custom chain
export const zeroGGalileo = {
    id: 16602,
    name: '0G Galileo Testnet',
    nativeCurrency: { name: '0G Token', symbol: '0G', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://evmrpc-testnet.0g.ai'] },
    },
    blockExplorers: {
        default: { name: '0GScan', url: 'https://chainscan-galileo.0g.ai' },
    },
} as const;

export const config = getDefaultConfig({
    appName: 'Aletheia Finance',
    projectId: '7d0d8293779e39665bc837052637738f', // Placeholder Project ID
    chains: [zeroGGalileo, mainnet, sepolia],
    ssr: true,
    transports: {
        [zeroGGalileo.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});
