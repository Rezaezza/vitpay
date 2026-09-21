"use client";

import { useState, useEffect, useRef } from "react";
import { parseUnits } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { generatePayrollHash } from "@/utils/crypto";
import { saveSalt } from "@/utils/saltStorage";
import {
  Shield, Lock, Eye, EyeOff, Loader2, Send,
  CheckCircle2, XCircle, AlertTriangle, UserPlus,
  Copy, AlertCircle, KeyRound
} from "lucide-react";
import Link from "next/link";

type EmployeeStatus = "idle" | "checking" | "valid" | "not_found" | "inactive" | "error";

// ─── Modal Konfirmasi dengan paksa copy salt ──────────────────────────────────
function ConfirmModal({
  employee, empName, amount, secret, onConfirm, onCancel, isLoading, statusText,
}: {
  employee: string; empName: string; amount: string; secret: string;
  onConfirm: () => void; onCancel: () => void;
  isLoading: boolean; statusText: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showSalt, setShowSalt] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
  };

  const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Shield size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-lg">Payment Confirmation</h3>
              <p className="text-xs text-zinc-500">Check the details and save the salt before proceeding</p>
            </div>
          </div>
        </div>

        {/* Detail Transaksi */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Employee</span>
            <span className="text-zinc-200 font-medium">
              {empName ? `${empName} (${shortAddr(employee)})` : shortAddr(employee)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Amount</span>
            <span className="text-cyan-400 font-bold">{amount} USDC</span>
          </div>
          <div className="h-px bg-zinc-800 my-1" />

          {/* Secret Salt — bagian kritis */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={14} className="text-amber-400" />
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Secret Salt — Save Now!</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm text-zinc-300 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 truncate">
                {showSalt ? secret : "•".repeat(Math.min(secret.length, 20))}
              </div>
              <button type="button" onClick={() => setShowSalt(!showSalt)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
              >
                {showSalt ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button type="button" onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                }`}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? "Saved!" : "Copy Salt"}
              </button>
            </div>
            <p className="text-[11px] text-amber-400/70 mt-2 flex items-start gap-1.5">
              <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />
              This salt is NOT stored on the blockchain. If you forget it, the transaction cannot be verified.
              The salt is automatically saved in your browser as an encrypted backup.
            </p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onCancel} disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-medium hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading || !copied}
            title={!copied ? "Copy salt first" : ""}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /><span className="text-sm">{statusText || "Processing..."}</span></>
            ) : (
              <><Send size={16} /><span>{copied ? "Confirm & Pay" : "Copy Salt first"}</span></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function SalaryForm() {
  const {
    contract, usdcContract, currentNetwork,
    isConnected, address, business,
  } = useWallet();

  const [employee, setEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [empStatus, setEmpStatus] = useState<EmployeeStatus>("idle");
  const [empName, setEmpName] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validasi employee real-time
  useEffect(() => {
    const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(employee);
    if (!isValidAddress) { setEmpStatus("idle"); setEmpName(""); return; }
    if (!contract || !address) { setEmpStatus("idle"); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setEmpStatus("checking"); setEmpName("");
      try {
        const data = await contract.getEmployee(address, employee);
        if (!data.exists) { setEmpStatus("not_found"); }
        else if (Number(data.status) !== 1) { setEmpStatus("inactive"); setEmpName(data.name); }
        else { setEmpStatus("valid"); setEmpName(data.name); }
      } catch (err: any) {
        const msg = err?.message ?? "";
        if (msg.includes("EmployeeNotFound") || msg.includes("execution reverted")) {
          setEmpStatus("not_found");
        } else { setEmpStatus("error"); }
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [employee, contract, address]);

  // Klik tombol "Pay" — buka modal konfirmasi dulu
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contract) { alert("Please connect your wallet first!"); return; }
    if (!business) { alert("Please register your business first."); return; }
    if (!usdcContract || !currentNetwork) { alert("Network not detected. Please reconnect your wallet."); return; }
    if (empStatus === "not_found" || empStatus === "error") { alert("Employee is not registered."); return; }
    if (empStatus === "inactive") { alert(`Employee ${empName} is inactive.`); return; }
    // Buka modal konfirmasi
    setShowConfirmModal(true);
  };

  // Eksekusi transaksi sebenarnya (dipanggil dari modal setelah user copy salt)
  const executePay = async () => {
    if (!contract || !usdcContract || !currentNetwork || !address) return;
    setIsLoading(true);
    try {
      const amountWei = parseUnits(amount, 6);
      setStatusText("Securing data (Hashing)...");
      const dataHash = generatePayrollHash(employee, amountWei.toString(), secret);

      setStatusText("Requesting USDC Approval...");
      const approveTx = await usdcContract.approve(currentNetwork.payrollContractAddress, amountWei);
      setStatusText("Waiting for Approval Confirmation...");
      await approveTx.wait();

      setStatusText("Processing Salary Transaction...");
      const payTx = await contract.paySalary(employee, amountWei, dataHash);
      setStatusText("Waiting for Blockchain Confirmation...");
      const receipt = await payTx.wait();

      // Simpan salt terenkripsi ke localStorage setelah transaksi sukses
      saveSalt(
        dataHash,
        secret,
        address,
        employee,
        amount,
        currentNetwork.key
      );

      console.log("Salt tersimpan untuk dataHash:", dataHash);
      setShowConfirmModal(false);
      alert("✅ Salary paid successfully! The salt is now saved in your browser as a backup.");
      setEmployee(""); setAmount(""); setSecret("");
      setEmpStatus("idle"); setEmpName("");
    } catch (error: any) {
      console.error("Transaction Failed:", error);
      alert("An error occurred or the transaction was cancelled.");
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
    error:     "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
  }[empStatus];

  const isPayDisabled =
    isLoading || !isConnected ||
    empStatus === "not_found" || empStatus === "inactive" ||
    empStatus === "checking" || empStatus === "error";

  return (
    <>
      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <ConfirmModal
          employee={employee} empName={empName}
          amount={amount} secret={secret}
          onConfirm={executePay}
          onCancel={() => { if (!isLoading) setShowConfirmModal(false); }}
          isLoading={isLoading} statusText={statusText}
        />
      )}

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

        <form onSubmit={handleSubmitForm} className="space-y-5 relative z-10">

          {/* Employee Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Employee Wallet Address</label>
            <input type="text" required value={employee}
              onChange={(e) => setEmployee(e.target.value)} placeholder="0x..."
              className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${employeeInputBorder}`}
            />
            <div className="mt-2 min-h-[20px]">
              {empStatus === "checking" && (
                <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Loader2 size={12} className="animate-spin" />
                  Checking employee status on the blockchain...
                </p>
              )}
              {empStatus === "valid" && (
                <p className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 size={13} />
                  <span><span className="font-bold">{empName}</span> — Employee is active and ready to receive salary</span>
                </p>
              )}
              {(empStatus === "not_found" || empStatus === "error") && (
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <XCircle size={13} className="flex-shrink-0" />
                    Address is not registered as an employee.
                  </p>
                  <Link href="/employees"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap transition-colors"
                  >
                    <UserPlus size={12} />
                    Register Now
                  </Link>
                </div>
              )}
              {empStatus === "inactive" && (
                <p className="flex items-center gap-1.5 text-xs text-orange-400">
                  <AlertTriangle size={13} />
                  <span><span className="font-bold">{empName}</span> is inactive. Please activate them in Settings.</span>
                </p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Amount (USDC)</label>
            <input type="number" required min="0" step="0.000001"
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
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
              <input type={showSecret ? "text" : "password"} required
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
              The salt will be required for copying before the transaction is executed. The browser automatically saves an encrypted backup.
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isPayDisabled}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Send size={18} />
            <span>Pay Salary Securely</span>
          </button>

        </form>
      </div>
    </>
  );
}
