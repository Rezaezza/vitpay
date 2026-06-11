"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ReceiptText, ShieldCheck, Settings } from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Employees", icon: Users, path: "/employees" },
  { name: "Transactions", icon: ReceiptText, path: "/transactions" },
  { name: "Privacy Log", icon: ShieldCheck, path: "/privacy" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen fixed left-0 top-0 glass-panel border-r border-zinc-800/50">
      <div className="h-20 flex items-center px-8 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            VitPay
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-zinc-800/50">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm">
          <p className="text-zinc-400 mb-1">Network</p>
          <div className="flex items-center gap-2 text-cyan-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Arc Testnet
          </div>
        </div>
      </div>
    </aside>
  );
}