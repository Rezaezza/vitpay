"use client"

import { useState } from "react";
import { Building2, Globe, Mail, MapPin, Link, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export default function RegisterBusiness() {
  const { contract, currentNetwork } = useWallet();

  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!contract || !companyName.trim()) return;

    setLoading(true);
    try {
      const tx = await contract.registerBusiness(companyName.trim());
      await tx.wait();

      // Jika ada data tambahan, langsung update business
      if (legalName || email || website || country) {
        const txUpdate = await contract.updateBusiness(
          companyName.trim(),
          legalName.trim(),
          email.trim(),
          website.trim(),
          "", // logoURI kosong dulu
          country.trim()
        );
        await txUpdate.wait();
      }

      alert("✅ Business berhasil didaftarkan di blockchain!");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("Register gagal. Pastikan wallet kamu terhubung dengan benar.");
    } finally {
      setLoading(false);
    }
  }

  const isMainnet = currentNetwork && !currentNetwork.isTestnet;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Building2 size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Register Business</h1>
          <p className="text-zinc-500 mt-2">
            Register your company to start using VitPay Payroll.
          </p>
        </div>

        {/* Warning Mainnet */}
        {isMainnet && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-400">You are on Arc Mainnet</p>
              <p className="text-xs text-orange-400/70 mt-0.5">
                This registration will use real USDC as gas. Please ensure your wallet has sufficient USDC balance.
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Company Name — wajib */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Company Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="PT. Contoh Jaya"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            {/* Legal Name — opsional */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Legal Name <span className="text-zinc-600 text-xs">(opsional)</span>
              </label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="PT. Contoh Jaya Tbk."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            {/* Email & Country dalam 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Email <span className="text-zinc-600 text-xs">(opsional)</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Country <span className="text-zinc-600 text-xs">(opsional)</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Indonesia"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Website — opsional */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Website <span className="text-zinc-600 text-xs">(opsional)</span>
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 flex items-start gap-2">
                <ShieldCheck size={13} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                Data bisnis kamu disimpan permanen di blockchain {currentNetwork?.label ?? "Arc"}. 
                Field opsional bisa diisi atau diupdate nanti di Settings.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !companyName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Mendaftarkan ke Blockchain...</span>
                </>
              ) : (
                <>
                  <Building2 size={18} />
                  <span>Register Business</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-zinc-600 mt-4">
          Hanya 1 business per wallet address yang diizinkan oleh smart contract.
        </p>

      </div>
    </div>
  );
}
