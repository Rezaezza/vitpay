import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  // 1. Setup koneksi langsung ke Arc Testnet menggunakan standar murni Ethers.js
  const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
  
  // 2. Ambil Private Key dari .env dengan aman
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ Private Key tidak ditemukan di file .env!");
  }
  
  // 3. Buat Wallet instance
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Mulai deployment dengan akun:", wallet.address);

  // Address USDC resmi dari Arc Testnet
  const usdcAddress = "0x3600000000000000000000000000000000000000";
  console.log("Mendeploy ConfidentialPayroll...");

  // 4. BACA ARTIFACT MANUAL (Bypass hre.ethers sepenuhnya!)
  const artifact = await hre.artifacts.readArtifact("ConfidentialPayroll");
  
  // 5. Buat Contract Factory menggunakan Ethers.js murni
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  // 6. Deploy Contract
  const payroll = await factory.deploy(wallet.address, usdcAddress);
  await payroll.waitForDeployment();
  
  const payrollAddress = await payroll.getAddress();
  
  console.log("==================================================");
  console.log("✅ Berhasil! ConfidentialPayroll di-deploy ke:", payrollAddress);
  console.log("🔗 Cek Explorer: https://testnet.arcscan.app/address/" + payrollAddress);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});