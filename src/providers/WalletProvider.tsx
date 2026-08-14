// FILE: src/providers/WalletProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { PAYROLL_ABI, PAYROLL_CONTRACT_ADDRESS } from "@/abi/ConfidentialPayroll";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  contract: Contract | null;

  business: any | null;
  refreshBusiness: () => Promise<void>;

  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  contract: null,

  business: null,
  refreshBusiness: async () => {},

  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  const [business, setBusiness] = useState<any>(null);

  const ARC_CHAIN_ID_HEX = "0x" + Number(5042002).toString(16);

  const switchToArcTestnet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ARC_CHAIN_ID_HEX,
                chainName: "Arc Testnet",
                rpcUrls: ["https://rpc.testnet.arc.network"],
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, 
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              },
            ],
          });
          return true;
        } catch (addError: any) {
          console.error("Gagal menambahkan Arc Testnet:", addError);
          return false;
        }
      }
      return false;
    }
  };

  const initEthers = useCallback(async (walletAddress: string) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const payrollContract = new Contract(PAYROLL_CONTRACT_ADDRESS, PAYROLL_ABI, signer);

    setAddress(walletAddress);
    setContract(payrollContract);

    try {
    const businessData = await payrollContract.getBusiness(walletAddress);

    if (Number(businessData.id) > 0) {
        setBusiness(businessData);
    } else {
        setBusiness(null);
    }

} catch {
    setBusiness(null);
}

    setIsConnected(true);
    
    localStorage.setItem("vitpay_connected", "true");
  }, []);

  const connectWallet = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert("MetaMask tidak ditemukan!");
      return;
    }

    setIsConnecting(true);
    try {
      const isCorrectNetwork = await switchToArcTestnet();
      if (!isCorrectNetwork) {
        setIsConnecting(false);
        return; 
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      await initEthers(accounts[0]);
    } catch (error: any) {
      console.error("Koneksi wallet gagal:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [initEthers]);


  const refreshBusiness = useCallback(async () => {
  if (!contract || !address) return;

  try {
    const businessData = await contract.getBusiness(address);
    setBusiness(businessData);
  } catch {
    setBusiness(null);
  }
}, [contract, address]);


  const disconnectWallet = () => {
    setAddress(null);
    setContract(null);
    setIsConnected(false);
    localStorage.removeItem("vitpay_connected");
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const checkConnection = async () => {
      const isPreviouslyConnected = localStorage.getItem("vitpay_connected") === "true";
      if (!isPreviouslyConnected) return;

      try {
        const chainId = await ethereum.request({ method: "eth_chainId" });
        if (chainId === ARC_CHAIN_ID_HEX) {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await initEthers(accounts[0]);
          }
        }
      } catch (err) {
        console.error("Gagal memulihkan sesi koneksi:", err);
      }
    };

    checkConnection();

    ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0) {
        initEthers(accounts[0]);
      } else {
        disconnectWallet();
      }
    });

    ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }, [initEthers, ARC_CHAIN_ID_HEX]);

  return (
    <WalletContext.Provider value={{
    address,
    isConnected,
    isConnecting,
    contract,

    business,
    refreshBusiness,

    connectWallet,
    disconnectWallet
}}>
      {children}
    </WalletContext.Provider>
  );
}