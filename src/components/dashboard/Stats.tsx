"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, History, Shield } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { formatUnits } from "ethers";

export default function Stats() {
  const {
  contract,
  isConnected,
  address,
} = useWallet();
  const [stats, setStats] = useState({
    totalEmployees: "0",
    totalPayrolls: "0",
    totalAmount: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (contract && isConnected) {
        try {
          if (!address) return;

const data = await contract.getStatistics(address);
          setStats({
            totalEmployees: data.totalEmployees.toString(),
            totalPayrolls: data.totalPayrolls.toString(),
            totalAmount: formatUnits(data.totalAmountPaid, 6), // USDC pakai 6 desimal
          });
        } catch (error) {
          console.error("Gagal mengambil statistik:", error);
        }
      }
    };
    fetchStats();
  }, [contract, isConnected, address]);

  const cards = [
    { name: "Employees", value: stats.totalEmployees, icon: Users, color: "text-blue-400" },
    { name: "Total Payroll", value: `${stats.totalAmount} USDC`, icon: CreditCard, color: "text-cyan-400" },
    { name: "Tx Records", value: stats.totalPayrolls, icon: History, color: "text-purple-400" },
    { name: "Privacy Status", value: "Encrypted", icon: Shield, color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.name} className="glass-panel p-6 rounded-2xl border border-zinc-800/50 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 ${card.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">{card.name}</p>
              <h4 className="text-xl font-bold text-zinc-100">{card.value}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
}