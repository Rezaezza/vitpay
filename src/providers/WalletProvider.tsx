// FILE: src/providers/WalletProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { PAYROLL_ABI, USDC_ABI } from "@/abi/ConfidentialPayroll";
import {
  NETWORKS, DEFAULT_NETWORK, getNetworkByChainId,
  type NetworkKey, type NetworkConfig,
} from "@/config/networks";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSwitchingNetwork: boolean;
  contract: Contract | null;
  usdcContract: Contract | null;
  currentNetwork: NetworkConfig | null;
  switchNetwork: (networkKey: NetworkKey) => Promise<void>;
  business: any | null;
  refreshBusiness: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null, isConnected: false, isConnecting: false,
  isSwitchingNetwork: false, contract: null, usdcContract: null,
  currentNetwork: null, switchNetwork: async () => {},
  business: null, refreshBusiness: async () => {},
  connectWallet: async () => {}, disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<Contract | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig | null>(null);
  const [business, setBusiness] = useState<any>(null);

  const requestNetworkSwitch = async (network: NetworkConfig): Promise<boolean> => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainIdHex }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: network.chainIdHex,
              chainName: network.label,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: network.blockExplorerUrls,
            }],
          });
          return true;
        } catch (addError: any) {
          console.error(`Gagal menambahkan ${network.label}:`, addError);
          return false;
        }
      }
      console.error(`Gagal switch ke ${network.label}:`, error);
      return false;
    }
  };

  const initContractsForNetwork = useCallback(async (
    walletAddress: string, network: NetworkConfig
  ) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const payrollContract = new Contract(network.payrollContractAddress, PAYROLL_ABI, signer);
    const usdc = new Contract(network.usdcAddress, USDC_ABI, signer);
    setAddress(walletAddress);
    setContract(payrollContract);
    setUsdcContract(usdc);
    setCurrentNetwork(network);
    try {
      if (network.payrollContractAddress === "0x0000000000000000000000000000000000000000") {
        setBusiness(null);
      } else {
        const businessData = await payrollContract.getBusiness(walletAddress);
        setBusiness(Number(businessData.id) > 0 ? businessData : null);
      }
    } catch {
      setBusiness(null);
    }
    setIsConnected(true);
    localStorage.setItem("vitpay_connected", "true");
    localStorage.setItem("vitpay_network", network.key);
  }, []);

  const switchNetwork = useCallback(async (networkKey: NetworkKey) => {
    const network = NETWORKS[networkKey];
    setIsSwitchingNetwork(true);
    try {
      const ok = await requestNetworkSwitch(network);
      if (ok) {
        setCurrentNetwork(network);
        if (address) await initContractsForNetwork(address, network);
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  }, [address, initContractsForNetwork]); // eslint-disable-line

  const connectWallet = useCallback(async () => {
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    alert("MetaMask tidak ditemukan!");
    return;
  }

  setIsConnecting(true);
  try {
    const savedNetworkKey = localStorage.getItem("vitpay_network") as NetworkKey | null;
    const targetNetwork = savedNetworkKey && NETWORKS[savedNetworkKey]
      ? NETWORKS[savedNetworkKey]
      : NETWORKS[DEFAULT_NETWORK];

    const ok = await requestNetworkSwitch(targetNetwork);
    if (!ok) return;

    // Cek apakah user sebelumnya sengaja disconnect
    const wasDisconnected = localStorage.getItem("vitpay_disconnected") === "true";

    let accounts: string[];

    if (wasDisconnected) {
      // Paksa MetaMask tampilkan popup pilih akun
      // Ini memastikan user bisa pilih wallet yang berbeda
      try {
        await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permError: any) {
        // User cancel popup — batalkan connect
        if (permError.code === 4001) {
          setIsConnecting(false);
          return;
        }
      }
      // Hapus flag disconnect setelah user sudah pilih akun
      localStorage.removeItem("vitpay_disconnected");
    }

    // Ambil akun yang sedang aktif di MetaMask
    accounts = await ethereum.request({ method: "eth_requestAccounts" });
    await initContractsForNetwork(accounts[0], targetNetwork);

  } catch (error: any) {
    console.error("Koneksi wallet gagal:", error);
  } finally {
    setIsConnecting(false);
  }
}, [initContractsForNetwork]);


  const refreshBusiness = useCallback(async () => {
    if (!contract || !address || !currentNetwork) return;
    if (currentNetwork.payrollContractAddress === "0x0000000000000000000000000000000000000000") {
      setBusiness(null); return;
    }
    try {
      const data = await contract.getBusiness(address);
      setBusiness(data);
    } catch { setBusiness(null); }
  }, [contract, address, currentNetwork]);

 const disconnectWallet = () => {
  setAddress(null);
  setContract(null);
  setUsdcContract(null);
  setIsConnected(false);
  setCurrentNetwork(null);
  setBusiness(null);
  // Hapus flag connected, set flag disconnected
  // supaya saat connect ulang kita paksa minta konfirmasi lagi
  localStorage.removeItem("vitpay_connected");
  localStorage.setItem("vitpay_disconnected", "true");
};


  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    const checkConnection = async () => {
      if (localStorage.getItem("vitpay_connected") !== "true") return;
      try {
        const chainIdHex: string = await ethereum.request({ method: "eth_chainId" });
        const detected = getNetworkByChainId(chainIdHex);
        if (!detected) return;
        const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) await initContractsForNetwork(accounts[0], detected);
      } catch (err) { console.error("Gagal memulihkan sesi:", err); }
    };
    checkConnection();
    ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0 && currentNetwork) {
        initContractsForNetwork(accounts[0], currentNetwork);
      } else { disconnectWallet(); }
    });
    ethereum.on("chainChanged", (chainIdHex: string) => {
      const detected = getNetworkByChainId(chainIdHex);
      if (detected) {
        setCurrentNetwork(detected);
        if (address) initContractsForNetwork(address, detected);
      } else { setCurrentNetwork(null); }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider value={{
      address, isConnected, isConnecting, isSwitchingNetwork,
      contract, usdcContract, currentNetwork, switchNetwork,
      business, refreshBusiness, connectWallet, disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
