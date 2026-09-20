// src/config/networks.ts
export type NetworkKey = "arcTestnet" | "arcMainnet";

export interface NetworkConfig {
  key: NetworkKey;
  label: string;
  shortLabel: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  explorerUrl: string;
  blockExplorerUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  isTestnet: boolean;
  usdcAddress: string;
  payrollContractAddress: string;
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  arcTestnet: {
    key: "arcTestnet",
    label: "Arc Testnet",
    shortLabel: "Testnet",
    chainId: 5042002,
    chainIdHex: "0x" + Number(5042002).toString(16),
    rpcUrl: "https://rpc.testnet.arc.io",
    explorerUrl: "https://explorer.testnet.arc.io",
    blockExplorerUrls: ["https://explorer.testnet.arc.io"],
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    isTestnet: true,
    usdcAddress: "0x3600000000000000000000000000000000000000",
    payrollContractAddress: "0xd520dec10363f8b05EDbc6198777FFDA1791BdCA",
  },
  arcMainnet: {
    key: "arcMainnet",
    label: "Arc Mainnet",
    shortLabel: "Mainnet",
    chainId: 5042,
    chainIdHex: "0x" + Number(5042).toString(16),
    rpcUrl: "https://rpc.mainnet.arc.io",
    explorerUrl: "https://explorer.arc.io",
    blockExplorerUrls: ["https://explorer.arc.io"],
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    isTestnet: false,
    usdcAddress: "0x3600000000000000000000000000000000000000",
    // Ganti ini setelah deploy contract ke mainnet
    payrollContractAddress: "0x0000000000000000000000000000000000000000",
  },
};

export const NETWORK_LIST: NetworkConfig[] = [NETWORKS.arcTestnet, NETWORKS.arcMainnet];
export const DEFAULT_NETWORK: NetworkKey = "arcTestnet";

export function getNetworkByChainId(chainId: string | number): NetworkConfig | null {
  const id = typeof chainId === "string"
    ? parseInt(chainId, chainId.startsWith("0x") ? 16 : 10)
    : chainId;
  return Object.values(NETWORKS).find((n) => n.chainId === id) ?? null;
}
