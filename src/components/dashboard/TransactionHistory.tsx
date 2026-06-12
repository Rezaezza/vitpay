// FILE: src/components/dashboard/TransactionHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { formatUnits } from "ethers";
import { ReceiptText, ExternalLink, Loader2 } from "lucide-react";

// Tipe data untuk transaksi
interface Transaction {
  id: number;
  employee: string;
  amount: string;
  timestamp: Date;
  status: number;
}

export default function TransactionHistory() {
  const { contract, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format address: 0x1234...ABCD
  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Format tanggal
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!contract || !isConnected) return;
      
      setIsLoading(true);
      try {
        // 1. Ambil total payroll yang pernah dibuat
        const stats = await contract.getStatistics();
        const total = Number(stats.totalPayrolls);

        if (total === 0) {
          setTransactions([]);
          setIsLoading(false);
          return;
        }

        // 2. Ambil 5 transaksi terakhir (loop mundur)
        const recentTxs: Transaction[] = [];
        const startIndex = total;
        const endIndex = Math.max(1, total - 4); // Ambil maksimal 5 data

        for (let i = startIndex; i >= endIndex; i--) {
          const tx = await contract.getPayroll(i);
          recentTxs.push({
            id: Number(tx.id),
            employee: tx.employee,
            amount: formatUnits(tx.amount, 6), // Convert USDC dari Wei
            timestamp: new Date(Number(tx.timestamp) * 1000), // Blockchain time dalam detik
            status: Number(tx.status),
          });
        }

        setTransactions(recentTxs);
      } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    
    // Opsional: Refresh tiap 15 detik agar real-time
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [contract, isConnected]);

  return (
    <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <ReceiptText size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Recent Payrolls</h3>
          <p className="text-sm text-zinc-500">Latest transactions on Arc Testnet</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!isConnected ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
            Connect wallet to view history
          </div>
        ) : isLoading && transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 size={24} className="animate-spin text-purple-400" />
            <span className="text-sm">Loading blockchain data...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="group flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700/50">
                    #{tx.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{formatAddress(tx.employee)}</p>
                    <p className="text-xs text-zinc-500">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-cyan-400">+{tx.amount} USDC</p>
                    <p className="text-xs text-green-400/80">Completed</p>
                  </div>
                  {/* Tombol ke Arc Explorer */}
                  <a 
                    href={`https://testnet.arcscan.app/address/${tx.employee}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="View Employee on Explorer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}