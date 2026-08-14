"use client";

import { useState } from "react";
import { Building2, Globe, Mail, Loader2 } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export default function RegisterBusiness() {
  const { contract } = useWallet();

  const [companyName, setCompanyName] = useState("");


  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!contract) return;

    try {
      setLoading(true);

   const tx = await contract.registerBusiness(companyName);

      await tx.wait();

      alert("Business berhasil didaftarkan.");

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Register gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-20 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="flex items-center gap-3 mb-6">

        <Building2 className="text-cyan-400"/>

        <div>

          <h1 className="text-2xl font-bold">
            Register Business
          </h1>

          <p className="text-zinc-400">
            Create your company profile before using VitPay.
          </p>

        </div>

      </div>

      <div className="space-y-4">

        <input
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3"
          placeholder="Company Name"
          value={companyName}
          onChange={(e)=>setCompanyName(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto"/>
          ) : (
            "Register Business"
          )}
        </button>

      </div>

    </div>
  );
}