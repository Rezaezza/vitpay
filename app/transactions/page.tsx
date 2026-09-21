// FILE: app/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { formatUnits } from "ethers";
import { getSaltForTx, deleteSalt } from "@/utils/saltStorage";
import {
  ReceiptText, ExternalLink, Loader2, ShieldCheck,
  KeyRound, Eye, EyeOff, Copy, CheckCircle2, Trash2, AlertCircle, Info
} from "lucide-react";

interface Transaction {
  id: number;
  employee: string;
  amount: string;
  timestamp: Date;
  status: number;
  dataHash: string;
}

// ─── Komponen Salt per baris tabel ────────────────────────────────────────────
function SaltCell({ dataHash, walletAddress }: { dataHash: string; walletAddress: string }) {
  const [revealed, setRevealed] = useState(false);
  const [salt, setSalt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const handleReveal = () => {
    if (!revealed) {
      const s = getSaltForTx(dataHash, walletAddress);
      setSalt(s);
      setShowNote(true); // tampilkan catatan saat pertama kali reveal
    }
    setRevealed(!revealed);
  };

  const handleCopy = () => {
    if (salt) {
      navigator.clipboard.writeText(salt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this salt backup from the browser? It cannot be restored.")) {
      deleteSalt(dataHash);
      setDeleted(true);
      setRevealed(false);
      setSalt(null);
      setShowNote(false);
    }
  };

  // Salt sudah dihapus manual
  if (deleted) {
    return (
      <span className="flex items-center gap-1 text-xs text-zinc-600 italic">
        <AlertCircle size={12} /> Salt deleted
      </span>
    );
  }

  // Salt tidak ada di browser ini
  if (revealed && salt === null) {
    return (
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-xs text-orange-400">
          <AlertCircle size={12} className="flex-shrink-0" />
          Salt not stored in this browser
        </span>
        {/* Catatan */}
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-500 leading-relaxed">
          <p className="flex items-start gap-1.5">
            <Info size={11} className="flex-shrink-0 mt-0.5 text-zinc-600" />
           The salt is stored only on the browser used to perform the transaction. 
           Opening it in a different browser or on another device will not locate this backup.
          </p>
        </div>
        <button
          onClick={() => { setRevealed(false); setSalt(null); }}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Baris tombol + salt */}
      <div className="flex items-center gap-1.5">
        {revealed && salt ? (
          <>
            <span className="font-mono text-xs text-amber-300 bg-zinc-900 px-2 py-1 rounded border border-amber-500/20 max-w-[130px] truncate">
              {salt}
            </span>
            <button onClick={handleCopy} title="Copy salt"
              className="p-1 rounded text-zinc-500 hover:text-green-400 transition-colors"
            >
              {copied
                ? <CheckCircle2 size={13} className="text-green-400" />
                : <Copy size={13} />
              }
            </button>
            <button onClick={handleDelete} title="Delete salt backup"
              className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
            <button onClick={() => { setRevealed(false); setShowNote(false); }}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <EyeOff size={13} />
            </button>
          </>
        ) : (
          <button onClick={handleReveal}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
          >
            <KeyRound size={12} />
            Lihat Salt
            <Eye size={12} />
          </button>
        )}
      </div>

      {/* Catatan penting — tampil saat salt berhasil di-reveal */}
      {revealed && salt && showNote && (
        <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400/80 leading-relaxed max-w-[280px]">
          <p className="flex items-start gap-1.5">
            <Info size={11} className="flex-shrink-0 mt-0.5" />
            <span>
              Salt is only stored in <span className="font-bold">browser ini</span>.
              The salt will not appear on other browsers or devices. 
              Save it in a password manager as a permanent backup.
            </span>
          </p>
          <button
            onClick={() => setShowNote(false)}
            className="mt-1.5 text-amber-400/50 hover:text-amber-400 transition-colors"
          >
            I understand, close
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const {
    contract, isConnected, address, business, currentNetwork,
  } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Guard: belum register business
  if (isConnected && !business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 max-w-sm w-full">
          <p className="text-orange-400 font-bold text-lg">Business Not Yet Registered</p>
          <p className="text-zinc-500 text-sm mt-2">
            Register your business on{" "}
            <span className="text-zinc-300 font-medium">
              {currentNetwork?.label ?? "jaringan ini"}
            </span>{" "}
            first.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2.5 bg-cyan-500 text-zinc-950 font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all"
          >
            Register Business
          </a>
        </div>
      </div>
    );
  }

  const formatAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatHash = (hash: string) =>
    `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(date);

  useEffect(() => {
    const fetchAllHistory = async () => {
      if (!contract || !isConnected || !address) return;
      setIsLoading(true);
      try {
        const payrollIds = await contract.getEmployerPayrollIds(address);
        if (payrollIds.length === 0) { setTransactions([]); return; }
        const ids = [...payrollIds].map(Number).reverse();
        const allTxs: Transaction[] = [];
        for (const id of ids) {
          const tx = await contract.getPayroll(id);
          allTxs.push({
            id: Number(tx.id),
            employee: tx.employee,
            amount: formatUnits(tx.amount, 6),
            timestamp: new Date(Number(tx.timestamp) * 1000),
            status: Number(tx.status),
            dataHash: tx.dataHash,
          });
        }
        setTransactions(allTxs);
      } catch (error) {
        console.error("Failed to retrieve transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllHistory();
  }, [contract, isConnected, address]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Transaction Ledger</h1>
        <p className="text-zinc-500">
          Complete history of all encrypted salary distributions on{" "}
          {currentNetwork?.label ?? "Arc"}
        </p>
      </div>

      {/* Tabel */}
      <div className="glass-panel rounded-2xl border border-zinc-800/50 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ReceiptText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">All Transactions</h3>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                <KeyRound size={11} className="text-amber-400" />
                Click "View Salt" to see the secret salt backup for each transaction
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-sm font-medium text-zinc-300">
            {transactions.length} Records Found
          </div>
        </div>

        <div className="overflow-x-auto">
          {!isConnected ? (
            <div className="p-12 text-center text-zinc-500">
              Connect your wallet to view the transaction ledger.
            </div>
          ) : isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <span>Syncing with {currentNetwork?.label ?? "blockchain"}...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No transactions have been made yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-4 font-medium">Tx ID</th>
                  <th className="px-5 py-4 font-medium">Employee</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Date & Time</th>
                  <th className="px-5 py-4 font-medium">Encryption Hash</th>
                  <th className="px-5 py-4 font-medium">
                    <span className="flex items-center gap-1">
                      <KeyRound size={12} className="text-amber-400" />
                      Secret Salt
                    </span>
                  </th>
                  <th className="px-5 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors align-top">
                    <td className="px-5 py-4">
                      <span className="font-bold text-zinc-300">#{tx.id}</span>
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-200">
                      {formatAddress(tx.employee)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-cyan-400">{tx.amount} USDC</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                        <span className="font-mono text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          {formatHash(tx.dataHash)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {address && (
                        <SaltCell
                          dataHash={tx.dataHash}
                          walletAddress={address}
                        />
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`${currentNetwork?.explorerUrl ?? "https://explorer.testnet.arc.io"}/address/${tx.employee}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors border border-transparent hover:border-cyan-500/20"
                      >
                        Explorer <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
