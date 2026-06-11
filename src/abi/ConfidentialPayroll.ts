// src/abi/ConfidentialPayroll.ts

// Address contract yang baru saja kamu deploy di Arc Testnet
export const PAYROLL_CONTRACT_ADDRESS = "0x32FF1840EAb8BBfc3a22C7824C62e919534a3a6e";

// Address resmi USDC di Arc Testnet
export const USDC_CONTRACT_ADDRESS = "0x3600000000000000000000000000000000000000";

// ==========================================
// ABI: CONFIDENTIAL PAYROLL (Ethers v6 Human-Readable Format)
// ==========================================
export const PAYROLL_ABI = [
  // --- Core Functions ---
  "function registerEmployee(address wallet, string employeeId, string name) external",
  "function updateEmployeeStatus(address employee, uint8 status) external",
  "function paySalary(address employee, uint256 amount, bytes32 dataHash) external",
  "function batchPaySalary(address[] employees, uint256[] amounts, bytes32[] dataHashes) external",
  
  // --- View Functions ---
  "function getEmployee(address employee) external view returns (tuple(address wallet, string employeeId, string name, bool exists, uint8 status, uint256 createdAt))",
  "function getPayroll(uint256 payrollId) external view returns (tuple(uint256 id, address employer, address employee, uint256 amount, bytes32 dataHash, uint8 status, uint256 timestamp))",
  "function getEmployeePayrollIds(address employee) external view returns (uint256[])",
  "function getStatistics() external view returns (tuple(uint256 totalEmployees, uint256 totalPayrolls, uint256 totalAmountPaid))",
  "function isEmployer(address account) external view returns (bool)",
  
  // --- Events ---
  "event EmployeeRegistered(address indexed employee, string employeeId, string name)",
  "event EmployeeStatusUpdated(address indexed employee, uint8 status)",
  "event SalaryPaid(uint256 indexed payrollId, address indexed employer, address indexed employee, uint256 amount, bytes32 dataHash)",
  
  // --- Custom Errors ---
  "error EmployeeNotFound()",
  "error EmployeeInactive()",
  "error InvalidAmount()",
  "error InvalidHash()",
  "error Unauthorized()",
  "error ZeroAddress()",
  "error TransferFailed()"
] as const;


// ==========================================
// ABI: USDC (Standard ERC20 Functions)
// ==========================================
export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
] as const;