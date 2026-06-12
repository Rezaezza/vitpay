// FILE: src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  History, 
  ShieldCheck, 
  Settings 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", icon: Home, href: "/home" }, 
    { name: "Payroll Hub", icon: LayoutDashboard, href: "/" }, 
    { name: "Employees", icon: Users, href: "/employees" },
    { name: "Transactions", icon: History, href: "/transactions" },
    { name: "Privacy Log", icon: ShieldCheck, href: "/privacy" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-cyan-500 tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-zinc-950 rounded-sm rotate-45" />
          </div>
          VitPay
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Icon size={20} className={isActive ? "text-cyan-400" : "group-hover:text-zinc-200"} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Network Status</p>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Arc Testnet</span>
          </div>
        </div>
      </div>
    </aside>
  );
}