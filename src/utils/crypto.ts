// FILE: src/utils/crypto.ts
import { solidityPackedKeccak256 } from "ethers";

/**
 * Menghasilkan hash data persis seperti keccak256(abi.encodePacked(...)) di Solidity
 */
export function generatePayrollHash(
  employee: string,
  amountWei: string,
  secretSalt: string
): string {
  return solidityPackedKeccak256(
    ["address", "uint256", "string"],
    [employee, amountWei, secretSalt]
  );
}