"use client";

import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-20 glass-panel border-b border-zinc-800/50 sticky top-0 z-40 flex items-center justify-between px-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Confidential Payroll</h2>
        <p className="text-sm text-zinc-500">Secure & encrypted salary distributions</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-700/50">
          <Bell size={20} />
        </button>
        
        {/* Tombol Wallet sementara (akan dibuat fungsional di Sprint 2) */}
        <button className="px-5 py-2.5 rounded-xl bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}