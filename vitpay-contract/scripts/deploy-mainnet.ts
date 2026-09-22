import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.mainnet.arc.io");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY tidak ditemukan di .env!");
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer wallet   :", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance (USDC)    :", ethers.formatUnits(balance, 18));

  const usdcAddress = "0x3600000000000000000000000000000000000000";
  console.log("USDC Address      :", usdcAddress);
  console.log("Mendeploy ConfidentialPayroll ke Arc Mainnet...");

  const artifact = await hre.artifacts.readArtifact("ConfidentialPayroll");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const payroll = await factory.deploy(wallet.address, usdcAddress);
  console.log("Menunggu konfirmasi blockchain...");
  await payroll.waitForDeployment();

  const payrollAddress = await payroll.getAddress();

  console.log("==================================================");
  console.log("✅ SUKSES! ConfidentialPayroll deployed ke Arc Mainnet:");
  console.log("📋 Contract Address :", payrollAddress);
  console.log("🔗 Explorer         : https://explorer.arc.io/address/" + payrollAddress);
  console.log("==================================================");
  console.log("");
  console.log("⚠️  Update src/config/networks.ts dengan address ini:");
  console.log(`   payrollContractAddress: "${payrollAddress}",`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
