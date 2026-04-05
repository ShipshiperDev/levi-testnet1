// ─────────────────────────────────────────────────────────────────
//  LEVI Contract Config
//  After deploying, fill .env.local — the UI auto-switches to LIVE
// ─────────────────────────────────────────────────────────────────

const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';

// ── Tempo native stablecoins ─────────────────────────────────────
export const PAYMENT_TOKENS = {
  testnet: [
    {
      symbol: 'pathUSD',
      address: '0x20c0000000000000000000000000000000000000' as `0x${string}`,
      decimals: 6,
    },
    {
      symbol: 'AlphaUSD',
      address: '0x20c0000000000000000000000000000000000001' as `0x${string}`,
      decimals: 6,
    },
  ],
  mainnet: [
    {
      symbol: 'pathUSD',
      address: '0x20c0000000000000000000000000000000000000' as `0x${string}`,
      decimals: 6,
    },
    {
      symbol: 'USDC',
      address: '0x20c000000000000000000000b9537d11c60e8b50' as `0x${string}`,
      decimals: 6,
    },
  ],
} as const;

// ── Per-network chain settings ───────────────────────────────────
export const NETWORKS = {
  testnet: {
    chainId: 42431,
    name: 'Tempo Testnet (Moderato)',
    rpc: 'https://rpc.moderato.tempo.xyz',
    explorer: 'https://explore.testnet.tempo.xyz',
    tokenAddress:   (process.env.NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS   ?? '') as `0x${string}`,
    presaleAddress: (process.env.NEXT_PUBLIC_TESTNET_PRESALE_ADDRESS ?? '') as `0x${string}`,
  },
  mainnet: {
    chainId: 4217,
    name: 'Tempo Mainnet',
    rpc: 'https://rpc.tempo.xyz',
    explorer: 'https://explore.tempo.xyz',
    tokenAddress:   (process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS   ?? '') as `0x${string}`,
    presaleAddress: (process.env.NEXT_PUBLIC_MAINNET_PRESALE_ADDRESS ?? '') as `0x${string}`,
  },
} as const;

export const ACTIVE_NETWORK = network;
export const ACTIVE_CONFIG  = NETWORKS[network];
export const ACTIVE_TOKENS  = PAYMENT_TOKENS[network];

/** Returns true only when real addresses have been configured in .env.local */
export function isDeployed(): boolean {
  return !!(
    ACTIVE_CONFIG?.presaleAddress?.startsWith('0x') &&
    ACTIVE_CONFIG?.presaleAddress?.length === 42 &&
    ACTIVE_CONFIG?.tokenAddress?.startsWith('0x') &&
    ACTIVE_CONFIG?.tokenAddress?.length === 42
  );
}
