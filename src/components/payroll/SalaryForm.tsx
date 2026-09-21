// FILE: src/components/payroll/SalaryForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { parseUnits } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { generatePayrollHash } from "@/utils/crypto";
import {
  Shield, Lock, Eye, EyeOff, Loader2, Send,
  CheckCircle2, XCircle, AlertTriangle, UserPlus
} from "lucide-react";
import Link from "next/link";

type EmployeeStatus = "idle" | "checking" | "valid" | "not_found" | "inactive" | "error";

export default function SalaryForm() {
  const {
    contract,
    usdcContract,
    currentNetwork,
    isConnected,
    address,
    business,
  } = useWallet();

  const [employee, setEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const [empStatus, setEmpStatus] = useState<EmployeeStatus>("idle");
  const [empName, setEmpName] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Address Ethereum valid: mulai dengan 0x dan panjang 42 karakter
    const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(employee);

    if (!isValidAddress) {
      setEmpStatus("idle");
      setEmpName("");
      return;
    }
    if (!contract || !address) {
      setEmpStatus("idle");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setEmpStatus("checking");
      setEmpName("");
      try {
        const data = await contract.getEmployee(address, employee);
        if (!data.exists) {
          setEmpStatus("not_found");
        } else if (Number(data.status) !== 1) {
          setEmpStatus("inactive");
          setEmpName(data.name);
        } else {
          setEmpStatus("valid");
          setEmpName(data.name);
        }
      } catch {
        setEmpStatus("error");
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [employee, contract, address]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contract) { alert("Silakan Connect Wallet terlebih dahulu!"); return; }
    if (!business) { alert("Silakan Register Business terlebih dahulu."); return; }
    if (!usdcContract || !currentNetwork) { alert("Network tidak terdeteksi. Coba reconnect wallet."); return; }
    if (empStatus === "not_found") { alert("Employee belum terdaftar. Daftarkan terlebih dahulu di halaman Employees."); return; }
    if (empStatus === "inactive") { alert(`Employee ${empName} berstatus Inactive dan tidak bisa menerima gaji.`); return; }

    setIsLoading(true);
    try {
      const amountWei = parseUnits(amount, 6);
      setStatusText("Mengamankan data (Hashing)...");
      const dataHash = generatePayrollHash(employee, amountWei.toString(), secret);
      setStatusText("Meminta Approval USDC...");
      const approveTx = await usdcContract.approve(currentNetwork.payrollContractAddress, amountWei);
      setStatusText("Menunggu konfirmasi Approval...");
      await approveTx.wait();
      setStatusText("Memproses Transaksi Gaji...");
      const payTx = await contract.paySalary(employee, amountWei, dataHash);
      setStatusText("Menunggu konfirmasi Blockchain...");
      await payTx.wait();
      alert("✅ Gaji berhasil dibayarkan dan dicatat secara rahasia!");
      setEmployee(""); setAmount(""); setSecret("");
      setEmpStatus("idle"); setEmpName("");
    } catch (error: any) {
      console.error("Transaksi Gagal:", error);
      alert("Terjadi kesalahan atau transaksi dibatalkan.");
    } finally {
      setIsLoading(false); setStatusText("");
    }
  };

  const employeeInputBorder = {
    idle:      "border-zinc-800 focus:border-cyan-500/50 focus:ring-cyan-500/50",
    checking:  "border-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/50",
    valid:     "border-green-500/60 focus:border-green-500 focus:ring-green-500/30",
    not_found: "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
    inactive:  "border-orange-500/60 focus:border-orange-500 focus:ring-orange-500/30",
    error:     "border-zinc-800 focus:border-cyan-500/50 focus:ring-cyan-500/50",
  }[empStatus];

  const isPayDisabled =
    isLoading || !isConnected ||
    empStatus === "not_found" ||
    empStatus === "inactive" ||
    empStatus === "checking";

  return (
    <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50 relative overflow-hidden">
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

        {/* Employee Wallet Address + Validasi */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Employee Wallet Address
          </label>
          <input
            type="text"
            required
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            placeholder="0x..."
            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${employeeInputBorder}`}
          />

          {/* Status indicator */}
          <div className="mt-2 min-h-[20px]">
            {empStatus === "checking" && (
              <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" />
                Memeriksa status employee di blockchain...
              </p>
            )}
            {empStatus === "valid" && (
              <p className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 size={13} />
                <span><span className="font-bold">{empName}</span> — Employee aktif, siap menerima gaji</span>
              </p>
            )}
            {empStatus === "not_found" && (
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <XCircle size={13} className="flex-shrink-0" />
                  Address ini belum terdaftar sebagai employee.
                </p>
                <Link href="/employees"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap transition-colors"
                >
                  <UserPlus size={12} />
                  Daftarkan sekarang
                </Link>
              </div>
            )}
            {empStatus === "inactive" && (
              <p className="flex items-center gap-1.5 text-xs text-orange-400">
                <AlertTriangle size={13} />
                <span><span className="font-bold">{empName}</span> berstatus Inactive. Aktifkan dulu di Settings.</span>
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Amount (USDC)</label>
          <input
            type="number" required min="0" step="0.000001"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Secret Salt */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Secret Salt (Encryption Key)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={16} className="text-zinc-500" />
            </div>
            <input
              type={showSecret ? "text" : "password"} required
              value={secret} onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter random phrase/number"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-12 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            <button type="button" onClick={() => setShowSecret(!showSecret)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            This salt ensures your payroll data cannot be reverse-engineered on the blockchain.
          </p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isPayDisabled}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /><span>{statusText}</span></>
          ) : (
            <><Send size={18} /><span>Pay Salary Securely</span></>
          )}
        </button>

      </form>
    </div>
  );
}
