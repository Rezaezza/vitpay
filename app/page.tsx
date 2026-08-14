// FILE: app/page.tsx

"use client";

import Stats from "@/components/dashboard/Stats";
import SalaryForm from "@/components/payroll/SalaryForm";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

import RegisterBusiness from "@/components/business/RegisterBusiness";
import { useWallet } from "@/providers/WalletProvider";

export default function Home() {

const { isConnected, business } = useWallet();

if (isConnected && !business) {
  return <RegisterBusiness />;
}

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500">Real-time statistics and operations on Arc Testnet</p>
      </div>

      {/* Komponen Statistik */}
      <Stats />

      {/* Layout Grid Bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Form Pay Salary */}
        <SalaryForm />
        
        {/* Riwayat Transaksi */}
        <div className="h-[520px]"> 
          <TransactionHistory />
        </div>

      </div>
    </div>
  );
}