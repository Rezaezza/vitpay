"use client";

import { useState } from "react";
import { Bell, Wallet, Loader2, LogOut, Copy, Check } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export default function Navbar() { 
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [isCopied, setIsCopied] = useState(false);

  // Format address: 0x1234...ABCD
  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Fungsi menyalin address
  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin text: ", err);
    }
  };

  return (
    <header className="h-20 glass-panel border-b border-zinc-800/50 sticky top-0 z-40 flex items-center justify-between px-8">
      {/* Bagian Kiri: Judul */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 leading-none mb-1">Confidential Payroll</h2>
        <p className="text-xs text-zinc-500">Secure & encrypted salary distributions on Arc</p>
      </div>

      {/* Bagian Kanan: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifikasi */}
        <button className="p-2.5 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800/50">
          <Bell size={18} />
        </button>
        
        {/* State: Terkoneksi */}
        {isConnected && address ? (
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 shadow-inner">
            {/* Tombol Copy & Tampilan Address */}
            <button 
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-all active:scale-95 font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{formatAddress(address)}</span>
              {isCopied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-zinc-500" />
              )}
            </button>

            {/* Pembatas */}
            <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

            {/* TOMBOL DISCONNECT (Ikon Keluar) */}
            <button
              onClick={disconnectWallet}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
              title="Disconnect Wallet"
            >
              <span className="text-xs font-medium hidden lg:inline">Disconnect</span>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          /* State: Belum Terkoneksi */
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wallet size={18} />
            )}
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        )}
      </div>
    </header>
  );
}