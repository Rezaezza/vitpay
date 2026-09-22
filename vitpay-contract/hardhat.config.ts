import type { HardhatUserConfig } from "hardhat/config";
import toolbox from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    arcTestnet: {
      type: "http",
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },

    arcMainnet: {
  type: "http",
  url: "https://rpc.mainnet.arc.io",   // <-- .io bukan .network
  chainId: 5042,
  accounts: process.env.PRIVATE_KEY
    ? [process.env.PRIVATE_KEY]
    : [],
},
  
  },


  plugins: [toolbox],
};

export default config;