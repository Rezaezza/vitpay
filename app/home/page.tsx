// FILE: app/home/page.tsx
"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock, 
  Coins, 
  ChevronRight,
  Database,
  ArrowUpRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto pb-20 overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-16 flex flex-col items-center text-center">
        {/* Dekorasi Background Cahaya */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Badge Berdenyut */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Next-Gen Payroll Protocol
        </div>

        {/* Headline Utama */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
          PRIVACY IS THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            NEW STANDARD.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed mb-10">
          VitPay is the economic operating system of the future. Distribute USDC globally with <span className="text-cyan-400">Zero-Knowledge</span> cryptographic security and <span className="text-purple-400">Sub-second</span> transaction speeds.
        </p>

        {/* Tombol CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
          <Link 
            href="/"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-zinc-950 font-bold hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Enter Payroll Hub <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="/presentation.html"
            target="_blank"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900/50 text-white font-bold hover:bg-zinc-800 transition-all border border-zinc-800 backdrop-blur-md"
          >
            Technical Docs
          </a>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 relative">
        <div className="glass-panel group p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/20 hover:border-cyan-500/30 transition-all relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <ShieldCheck size={100} />
            </div>
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mb-6">
                <Lock size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Keccak256 Privacy</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
                Every transaction is encrypted locally before touching the blockchain. Your payroll amounts are safe from public surveillance.
            </p>
        </div>

        <div className="glass-panel group p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/20 hover:border-purple-500/30 transition-all relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Zap size={100} />
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-6">
                <Zap size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Instant Settlement</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
                Powered by the Malachite Consensus Engine. Transactions settle in milliseconds with zero risk of network rollback.
            </p>
        </div>

        <div className="glass-panel group p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/20 hover:border-blue-500/30 transition-all relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Coins size={100} />
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-6">
                <Globe size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Stable Economy</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
                Utilize USDC for corporate accounting efficiency. Eliminate the dangerous risks of crypto market volatility.
            </p>
        </div>
      </section>

      {/* --- INFO SECTION (WHY VITPAY) --- */}
      <section className="mt-20 p-12 rounded-[40px] bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/50 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white leading-tight">
                    Why Enterprises <br /> Choose VitPay?
                </h2>
                <p className="text-zinc-500">
                    Blockchain transparency is a double-edged sword. VitPay grants you full control over your corporate financial privacy.
                </p>
                
                <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400"><ChevronRight size={18} /></div>
                        <div>
                            <p className="text-zinc-200 font-bold">Admin-Only Access</p>
                            <p className="text-sm text-zinc-500">Only authorized master wallets can execute payroll distributions.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400"><ChevronRight size={18} /></div>
                        <div>
                            <p className="text-zinc-200 font-bold">Immutable Ledger</p>
                            <p className="text-sm text-zinc-500">A permanent audit trail that cannot be tampered with or manipulated.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONFIDENTIALITY WORKFLOW MENGGANTIKAN TERMINAL BOHONGAN --- */}
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full" />
                <div className="relative p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-cyan-400" size={24} />
                            <span className="text-zinc-100 font-bold text-lg">Confidentiality Workflow</span>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">1</div>
                            <div>
                                <h4 className="text-zinc-200 font-bold text-sm mb-1">Local Encryption</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Salary data (wallet, amount, secret salt) is encrypted into a Keccak256 Hash entirely within the browser before reaching the network.
                                </p>
                            </div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">2</div>
                            <div>
                                <h4 className="text-zinc-200 font-bold text-sm mb-1">On-Chain Settlement</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    The VitPay smart contract processes the USDC transfer instantly without storing the actual nominal value on the public ledger.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">3</div>
                            <div>
                                <h4 className="text-zinc-200 font-bold text-sm mb-1">Zero-Knowledge Audit</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Auditors can verify the authenticity of any transaction via the Privacy Log using the original employer's Secret Salt.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-20 pt-10 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600 text-sm">
        <p>© 2026 VitPay Protocol. Running on Arc Blockhain ID: 5042002.</p>
        <div className="flex items-center gap-8">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Payroll Hub</Link>
            <a href="/presentation.html" target="_blank" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <Link href="/settings" className="hover:text-zinc-300 transition-colors">Settings</Link>
        </div>
      </footer>

    </div>
  );
}