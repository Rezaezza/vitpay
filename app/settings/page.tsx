// FILE: app/settings/page.tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/providers/WalletProvider";

import { 
  Settings as SettingsIcon, 
  Cpu, 
  Link as LinkIcon, 
  UserCog, 
  Trash2, 
  ExternalLink, 
  ShieldCheck,
  Loader2,
  RefreshCcw
} from "lucide-react";

export default function SettingsPage() {
  const { contract, isConnected, disconnectWallet, currentNetwork, business } = useWallet();

const payrollAddress = currentNetwork?.payrollContractAddress ?? "-";
const usdcAddress = currentNetwork?.usdcAddress ?? "-";
const explorerBase = currentNetwork?.explorerUrl ?? "https://explorer.testnet.arc.io";

// Guard: belum register business di jaringan ini
if (isConnected && !business) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 max-w-sm w-full">
        <p className="text-orange-400 font-bold text-lg">Business Not Yet Registered</p>
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


  
  // State untuk Update Status Karyawan
  const [empWallet, setEmpWallet] = useState("");
  const [empStatus, setEmpStatus] = useState("1"); // 1 = Active, 2 = Inactive
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !isConnected) return;

    setIsUpdating(true);
    try {
      const tx = await contract.updateEmployeeStatus(empWallet, parseInt(empStatus));
      await tx.wait();
      alert("✅ Employee status successfully updated on the blockchain!");
      setEmpWallet("");
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Please ensure you are the Admin/Employer.");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCache = () => {
    if(confirm("Clear all session data and disconnect wallet?")) {
      disconnectWallet();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">System Settings</h1>
        <p className="text-zinc-500">Configure payroll parameters and blockchain connectivity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: MANAGEMENT ACTIONS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Employee Access Control */}
          <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <UserCog size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Employee Access Control</h3>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-5">
              <p className="text-sm text-zinc-500 mb-4">
                Update employee status to <span className="text-zinc-300">Active</span> or <span className="text-zinc-300">Inactive</span>. 
                Inactive employees cannot receive salary payments.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Employee Wallet Address</label>
                <input
                  type="text"
                  required
                  value={empWallet}
                  onChange={(e) => setEmpWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">New Status</label>
                <select 
                  value={empStatus}
                  onChange={(e) => setEmpStatus(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-orange-500/50"
                >
                  <option value="1">Active (Status 1)</option>
                  <option value="2">Inactive (Status 2)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUpdating || !isConnected}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                Update Status on Chain
              </button>
            </form>
          </div>

          {/* 2. System Architecture Information */}
          <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Cpu size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Protocol Architecture</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Payroll Smart Contract</p>
                  <p className="text-sm font-mono text-zinc-300 break-all">{payrollAddress}</p>

                </div>
                <a href={`${explorerBase}/address/${payrollAddress}`} target="_blank" className="p-2 text-zinc-500 hover:text-blue-400 transition-colors">
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">USDC Token Contract</p>
                  <p className="text-sm font-mono text-zinc-300 break-all">{usdcAddress}</p>

                </div>
                <a href={`${explorerBase}/address/${usdcAddress}`} target="_blank" className="p-2 text-zinc-500 hover:text-blue-400 transition-colors">
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: NETWORK & DANGER ZONE */}
        <div className="space-y-8">
          
          {/* Network Info */}
          <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <LinkIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Network Info</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Chain ID</span>
                <span className="text-zinc-200 font-mono">{currentNetwork?.chainId ?? "-"}</span>

              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Currency</span>
                <span className="text-zinc-200">USDC {currentNetwork?.isTestnet ? "(Testnet)" : "(Mainnet)"}</span>

              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Privacy Layer</span>
                <span className="text-green-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> Keccak256 Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel rounded-2xl p-8 border border-red-500/10">
            <h3 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Clearing the local cache will remove your connection history. You will need to reconnect MetaMask manually.
            </p>
            <button 
              onClick={clearCache}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl transition-all font-bold"
            >
              <Trash2 size={18} />
              Clear Browser Session
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}