// FILE: src/components/payroll/SalaryForm.tsx
"use client";

import { useState } from "react";
import { parseUnits, Contract, BrowserProvider } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { PAYROLL_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, USDC_ABI } from "@/abi/ConfidentialPayroll";
import { generatePayrollHash } from "@/utils/crypto";
import { Shield, Lock, Eye, EyeOff, Loader2, Send } from "lucide-react";

export default function SalaryForm() {
  const { contract, isConnected } = useWallet();
  const [employee, setEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contract) {
      alert("Silakan Connect Wallet terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Konversi Amount ke Wei (USDC menggunakan 6 desimal)
      const amountWei = parseUnits(amount, 6);
      
      // 2. Generate Hash Rahasia
      setStatusText("Mengamankan data (Hashing)...");
      const dataHash = generatePayrollHash(employee, amountWei.toString(), secret);

      // 3. Setup Contract USDC untuk Approval
      setStatusText("Meminta Approval USDC...");
      const ethereum = (window as any).ethereum;
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const usdcContract = new Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, signer);

      // 4. Panggil fungsi Approve (Minta izin ke USDC untuk ditarik oleh VitPay)
      const approveTx = await usdcContract.approve(PAYROLL_CONTRACT_ADDRESS, amountWei);
      setStatusText("Menunggu konfirmasi Approval...");
      await approveTx.wait();

      // 5. Eksekusi Pembayaran Gaji di Contract VitPay
      setStatusText("Memproses Transaksi Gaji...");
      const payTx = await contract.paySalary(employee, amountWei, dataHash);
      setStatusText("Menunggu konfirmasi Blockchain...");
      await payTx.wait();

      alert("✅ Gaji berhasil dibayarkan dan dicatat secara rahasia!");
      
      // Kosongkan form setelah sukses
      setEmployee("");
      setAmount("");
      setSecret("");
    } catch (error: any) {
      console.error("Transaksi Gagal:", error);
      alert("Terjadi kesalahan atau transaksi dibatalkan.");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Send Salary</h3>
          <p className="text-sm text-zinc-500">Encrypted payroll transaction</p>
        </div>
      </div>

      <form onSubmit={handlePay} className="space-y-5 relative z-10">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Employee Wallet Address</label>
          <input
            type="text"
            required
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            placeholder="0x..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Amount (USDC)</label>
          <input
            type="number"
            required
            min="0"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Secret Salt (Encryption Key)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={16} className="text-zinc-500" />
            </div>
            <input
              type={showSecret ? "text" : "password"}
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter random phrase/number"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-12 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            This salt ensures your payroll data cannot be reverse-engineered on the blockchain.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isConnected}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{statusText}</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Pay Salary Securely</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}