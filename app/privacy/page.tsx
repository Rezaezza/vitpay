// FILE: app/privacy/page.tsx
"use client";

import { useState } from "react";
import { parseUnits } from "ethers";
import { generatePayrollHash } from "@/utils/crypto";
import { ShieldCheck, Lock, Key, FileCode2, CheckCircle2, AlertCircle } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export default function PrivacyPage() {

 const { isConnected, business, currentNetwork } = useWallet();

// Guard: belum register business di jaringan ini
if (isConnected && !business) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 max-w-sm w-full">
        <p className="text-orange-400 font-bold text-lg">Business Belum Terdaftar</p>
        <p className="text-zinc-500 text-sm mt-2">
          Register your business at <span className="text-zinc-300 font-medium">{currentNetwork?.label ?? "jaringan ini"}</span> terlebih dahulu untuk mengakses halaman ini.
        </p>
        <a href="/" className="inline-block mt-4 px-6 py-2.5 bg-cyan-500 text-zinc-950 font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all">
          Register Business
        </a>
      </div>
    </div>
  );
}


  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [salt, setSalt] = useState("");
  
  const [generatedHash, setGeneratedHash] = useState("");
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedHash("");

    try {
      if (!wallet || !amount || !salt) {
        setError("Semua kolom harus diisi.");
        return;
      }

      // Konversi amount ke Wei (harus sama persis dengan yang ada di SalaryForm)
      const amountWei = parseUnits(amount, 6);
      
      // Generate Hash
      const hash = generatePayrollHash(wallet, amountWei.toString(), salt);
      setGeneratedHash(hash);
    } catch (err) {
      console.error("Hashing error:", err);
      setError("Format data tidak valid. Pastikan nominal angka benar.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Privacy & Audit Log</h1>
        <p className="text-zinc-500">Cryptographic verification tool for confidential transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* KOLOM KIRI (LEBIH LEBAR): HASH VERIFIER TOOL */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-8 border border-zinc-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              <FileCode2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Zero-Knowledge Verifier</h3>
              <p className="text-sm text-zinc-500">Generate local hash to match blockchain records</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Original Wallet Address</label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Original Amount (USDC)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Secret Salt Used</label>
                <input
                  type="text"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  placeholder="Enter secret salt"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-green-400 font-bold py-3.5 rounded-xl transition-all border border-zinc-700/50 mt-4"
            >
              <Key size={18} />
              Generate Proof Hash
            </button>
          </form>

          {/* HASIL GENERATE HASH */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {generatedHash && (
            <div className="mt-6 p-6 rounded-xl bg-zinc-950 border border-green-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <h4 className="text-sm font-bold text-green-400">Keccak256 Hash Generated</h4>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-300 break-all">
                  {generatedHash}
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  * Compare this hash with the "Encryption Hash" shown in the Transaction Ledger to prove authenticity to auditors.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: EXPLANATION / EDUKASI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">How it Works</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-cyan-500 before:rounded-full before:shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <h4 className="text-sm font-bold text-zinc-200 mb-1">1. Mathematical One-Way Function</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  VitPay uses the <span className="text-cyan-400 font-mono">Keccak256</span> cryptographic algorithm. It mathematically scrambles your data into a fixed-length string that cannot be reverse-engineered.
                </p>
              </div>

              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-500 before:rounded-full before:shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <h4 className="text-sm font-bold text-zinc-200 mb-1">2. Anti Brute-Force (Salting)</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  By adding a <span className="text-purple-400 font-mono">Secret Salt</span> (a random password known only to you), attackers cannot guess the salary amount by hashing random numbers.
                </p>
              </div>

              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-500 before:rounded-full before:shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <h4 className="text-sm font-bold text-zinc-200 mb-1">3. Immutable Auditing</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  When audited, simply provide the original data and the salt. If the resulting hash matches the blockchain, the payment is cryptographically verified.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <Lock size={24} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Enterprise Grade Security</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}