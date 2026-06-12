// FILE: app/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { formatUnits } from "ethers";
import { ReceiptText, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

interface Transaction {
  id: number;
  employee: string;
  amount: string;
  timestamp: Date;
  status: number;
  dataHash: string; // Di halaman full, kita tampilkan hash rahasianya!
}

export default function TransactionsPage() {
  const { contract, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatHash = (hash: string) => `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    const fetchAllHistory = async () => {
      if (!contract || !isConnected) return;
      
      setIsLoading(true);
      try {
        const stats = await contract.getStatistics();
        const total = Number(stats.totalPayrolls);

        if (total === 0) {
          setTransactions([]);
          setIsLoading(false);
          return;
        }

        const allTxs: Transaction[] = [];
        // Loop mundur untuk mengambil SEMUA transaksi (dari yang terbaru ke terlama)
        for (let i = total; i >= 1; i--) {
          const tx = await contract.getPayroll(i);
          allTxs.push({
            id: Number(tx.id),
            employee: tx.employee,
            amount: formatUnits(tx.amount, 6),
            timestamp: new Date(Number(tx.timestamp) * 1000),
            status: Number(tx.status),
            dataHash: tx.dataHash, // Ambil data enkripsi
          });
        }

        setTransactions(allTxs);
      } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllHistory();
  }, [contract, isConnected]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Transaction Ledger</h1>
        <p className="text-zinc-500">Complete history of all encrypted salary distributions</p>
      </div>

      {/* Kontainer Tabel Utama */}
      <div className="glass-panel rounded-2xl border border-zinc-800/50 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ReceiptText size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">All Transactions</h3>
          </div>
          {/* Total Data Badge */}
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
              <span>Syncing with Arc Testnet...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No transactions have been made yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Tx ID</th>
                  <th className="px-6 py-4 font-medium">Employee Address</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Encryption Hash (Keccak256)</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-300">#{tx.id}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {formatAddress(tx.employee)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-cyan-400">{tx.amount} USDC</span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span className="font-mono text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          {formatHash(tx.dataHash)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://testnet.arcscan.app/address/${tx.employee}`}
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