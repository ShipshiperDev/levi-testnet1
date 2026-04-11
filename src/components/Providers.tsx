'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { NETWORKS } from '@/config/contracts';
import { LanguageProvider } from '@/context/LanguageContext';

const tempoTestnet = defineChain({
  id: NETWORKS.testnet.chainId,
  name: NETWORKS.testnet.name,
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls:  { default: { http: [NETWORKS.testnet.rpc] } },
  blockExplorers: { default: { name: 'Tempo Explorer', url: NETWORKS.testnet.explorer } },
});

const tempoMainnet = defineChain({
  id: NETWORKS.mainnet.chainId,
  name: NETWORKS.mainnet.name,
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls:  { default: { http: [NETWORKS.mainnet.rpc] } },
  blockExplorers: { default: { name: 'Tempo Explorer', url: NETWORKS.mainnet.explorer } },
});

const config = createConfig({
  chains: [tempoTestnet, tempoMainnet],
  transports: {
    [tempoTestnet.id]: http(),
    [tempoMainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
