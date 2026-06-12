import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20", // (Pastikan versi ini sama dengan yang kamu pakai)
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5042002
    }
  },
  // INI BAGIAN PALING PENTING UNTUK VERIFY DI ARC
  etherscan: {
    apiKey: {
      arcTestnet: process.env.ARCSCAN_API_KEY || "dummy-key"
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app"
        }
      }
    ]
  }
};

export default config;