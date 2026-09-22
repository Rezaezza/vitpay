"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { NETWORK_LIST, type NetworkConfig } from "@/config/networks";

export default function NetworkSwitcher() {
  const { currentNetwork, switchNetwork, isSwitchingNetwork } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isMainnet = currentNetwork && !currentNetwork.isTestnet;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={isSwitchingNetwork}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700 transition-all disabled:opacity-50"
      >
        <Globe size={14} className={isMainnet ? "text-cyan-400" : "text-yellow-400"} />
        <span className="font-medium hidden sm:inline">
          {isSwitchingNetwork ? "Switching..." : (currentNetwork?.shortLabel ?? "Select Network")}
        </span>
        {currentNetwork && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md hidden sm:inline ${
            currentNetwork.isTestnet
              ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
              : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
          }`}>
            {currentNetwork.isTestnet ? "TESTNET" : "MAINNET"}
          </span>
        )}
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 pt-3 pb-1">
            Pilih Jaringan
          </p>
          <div className="p-1.5 flex flex-col gap-0.5">
            {NETWORK_LIST.map((network) => {
              const isActive = currentNetwork?.key === network.key;
              return (
                <button key={network.key}
                  onClick={() => { setIsOpen(false); switchNetwork(network.key); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${network.isTestnet ? "bg-yellow-400" : "bg-cyan-400"}`} />
                    <div className="text-left">
                      <p className="font-medium leading-none">{network.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Chain ID: {network.chainId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!network.isTestnet && network.payrollContractAddress === "0x0000000000000000000000000000000000000000" && (
                      <span title="Contract belum di-deploy">
  <AlertTriangle size={13} className="text-orange-400" />
</span>

                    )}
                    {isActive && <CheckCircle2 size={14} className="text-cyan-400" />}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      network.isTestnet ? "bg-yellow-500/15 text-yellow-400" : "bg-cyan-500/15 text-cyan-400"
                    }`}>
                      {network.isTestnet ? "TESTNET" : "MAINNET"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {isMainnet && (
            <div className="mx-2 mb-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-[11px] text-orange-400 flex items-center gap-1.5">
                <AlertTriangle size={11} />
                Mainnet: transaksi menggunakan USDC sungguhan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
