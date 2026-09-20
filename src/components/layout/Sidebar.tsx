// FILE: src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/providers/WalletProvider";
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  History, 
  ShieldCheck, 
  Settings,
  Lock
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isConnected, business, currentNetwork } = useWallet();

  // Menu yang selalu tampil
  const publicMenuItems = [
    { name: "Home", icon: Home, href: "/home" },
  ];

  // Menu yang hanya tampil setelah register business
  const protectedMenuItems = [
    { name: "Payroll Hub", icon: LayoutDashboard, href: "/" },
    { name: "Employees", icon: Users, href: "/employees" },
    { name: "Transactions", icon: History, href: "/transactions" },
    { name: "Privacy Log", icon: ShieldCheck, href: "/privacy" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  // Business dianggap terdaftar kalau wallet connect DAN ada data business
  const hasRegistered = isConnected && !!business;

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      
      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-cyan-500 tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-zinc-950 rounded-sm rotate-45" />
          </div>
          VitPay
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">

        {/* Menu Publik */}
        {publicMenuItems.map((item) => {
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

        {/* Divider */}
        <div className="pt-2 pb-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            {hasRegistered ? "App Menu" : "Locked"}
          </p>
        </div>

        {/* Menu Protected */}
        {hasRegistered ? (
          protectedMenuItems.map((item) => {
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
          })
        ) : (
          // Tampil menu terkunci kalau belum register
          <div className="px-4 py-3 rounded-xl border border-dashed border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-600">
              <Lock size={16} />
              <div>
                <p className="text-xs font-medium">
                  {isConnected ? "Register Business" : "Connect Wallet"}
                </p>
                <p className="text-[10px] text-zinc-700 mt-0.5">
                  {isConnected
                    ? `Diperlukan di ${currentNetwork?.label ?? "jaringan ini"}`
                    : "untuk mengakses menu"}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Network Status */}
      <div className="p-4 border-t border-zinc-800/50">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Network Status</p>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
              !currentNetwork
                ? "bg-zinc-600"
                : currentNetwork.isTestnet
                ? "bg-yellow-400"
                : "bg-cyan-400"
            }`} />
            <span className="text-xs font-bold uppercase tracking-widest truncate">
              {currentNetwork?.label ?? "Not Connected"}
            </span>
          </div>
          {/* Badge register status */}
          {isConnected && (
            <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-md w-fit ${
              hasRegistered
                ? "bg-green-500/10 text-green-400"
                : "bg-orange-500/10 text-orange-400"
            }`}>
              {hasRegistered ? "Business Registered" : "Not Registered"}
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
