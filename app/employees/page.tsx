// FILE: app/employees/page.tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { UserPlus, Search, UserCheck, ShieldAlert, Loader2, UserRoundX } from "lucide-react";

export default function EmployeesPage() {
  const {
  contract,
  isConnected,
  address,
} = useWallet();
  
  // State untuk Registrasi
  const [regWallet, setRegWallet] = useState("");
  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // State untuk Pencarian Karyawan
  const [searchWallet, setSearchWallet] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  // Fungsi Register Karyawan
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contract || !address) {
      alert("Silakan Connect Wallet terlebih dahulu!");
      return;
    }

    setIsRegistering(true);
    try {
      const tx = await contract.registerEmployee(regWallet, regId, regName);
      await tx.wait();
      
      window.dispatchEvent(new Event("employeeRegistered")); // Tunggu konfirmasi blockchain
      
      alert(`✅ Success! Employee ${regName} officially registered on the blockchain.`);
      setRegWallet("");
      setRegId("");
      setRegName("");
    } catch (error: any) {
      console.error("Failed to register employee:", error);
      alert("Failed to register employee. Ensure you use the Admin/Employer wallet..");
    } finally {
      setIsRegistering(false);
    }
  };

  // Fungsi Cari Karyawan
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contract) return;

    setIsSearching(true);
    setSearchError("");
    setEmployeeData(null);

    try {
      // getEmployee mengembalikan tuple dari smart contract
      if (!address) {
  alert("Wallet not connected.");
  return;
}

const data = await contract.getEmployee(
  address,
  searchWallet
);
      
      // Jika 'exists' bernilai false, berarti belum terdaftar
      if (!data.exists) {
        setSearchError("An employee with this wallet was not found..");
      } else {
        setEmployeeData({
          wallet: data.wallet,
          employeeId: data.employeeId,
          name: data.name,
          status: Number(data.status) === 1 ? "Active" : "Inactive",
          createdAt: new Date(Number(data.createdAt) * 1000).toLocaleDateString(),
        });
      }
    } catch (error: any) {
      console.error("Error while searching for employees:", error);
      setSearchError("An error occurred while searching for data on the network.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Employee Directory</h1>
        <p className="text-zinc-500">Register and manage staff identities on Arc Testnet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* KOLOM KIRI: FORM REGISTRASI */}
        <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserPlus size={20} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Register New Employee</h3>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Employee Wallet Address</label>
              <input
                type="text"
                required
                value={regWallet}
                onChange={(e) => setRegWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Employee ID</label>
                <input
                  type="text"
                  required
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="EMP-001"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering || !isConnected}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2"
            >
              {isRegistering ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {isRegistering ? "Registering to Blockchain..." : "Register Employee"}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: LOOKUP KARYAWAN */}
        <div className="glass-panel rounded-2xl p-8 border border-zinc-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Search size={20} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Employee Lookup</h3>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="text"
              required
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
              placeholder="Enter Wallet Address (0x...)"
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
            />
            <button
              type="submit"
              disabled={isSearching || !isConnected}
              className="px-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl transition-all disabled:opacity-50 border border-zinc-700/50"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : "Search"}
            </button>
          </form>

          {/* HASIL PENCARIAN */}
          <div className="min-h-[200px] flex flex-col justify-center">
            {employeeData ? (
              <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <UserCheck className="text-cyan-400" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-100">{employeeData.name}</h4>
                      <p className="text-sm text-zinc-500">ID: {employeeData.employeeId}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${employeeData.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {employeeData.status}
                  </div>
                </div>
                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Wallet</span>
                    <span className="text-zinc-300 font-mono text-xs">{employeeData.wallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Registered On</span>
                    <span className="text-zinc-300">{employeeData.createdAt}</span>
                  </div>
                </div>
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center justify-center gap-3 text-red-400 p-6 rounded-xl bg-red-500/5 border border-red-500/10">
                <UserRoundX size={32} />
                <p className="text-sm text-center">{searchError}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                <ShieldAlert size={32} className="opacity-50" />
                <p className="text-sm">Search a wallet address to verify employee status.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}