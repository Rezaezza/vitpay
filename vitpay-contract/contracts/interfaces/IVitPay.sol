// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PayrollStructs} from "../structs/PayrollStructs.sol";
import {PayrollErrors} from "../errors/PayrollErrors.sol";

/// @title IVitPay - VitPay Main Interface
/// @notice Interface untuk interaksi dengan contract ConfidentialPayroll
interface IVitPay is PayrollStructs, PayrollErrors {
    
    // ==========================================
    // EVENTS
    // ==========================================
    
    event EmployeeRegistered(
        address indexed employee,
        string employeeId,
        string name
    );

    event EmployeeStatusUpdated(
        address indexed employee,
        EmployeeStatus status
    );

    event SalaryPaid(
        uint256 indexed payrollId,
        address indexed employer,
        address indexed employee,
        uint256 amount,
        bytes32 dataHash
    );

    event PayrollCancelled(uint256 indexed payrollId);
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // ==========================================
    // CORE FUNCTIONS
    // ==========================================

    function registerEmployee(
        address wallet,
        string calldata employeeId,
        string calldata name
    ) external;

    function updateEmployeeStatus(
        address employee,
        EmployeeStatus status
    ) external;

    function paySalary(
        address employee,
        uint256 amount,
        bytes32 dataHash
    ) external;

    function batchPaySalary(
        address[] calldata employees,
        uint256[] calldata amounts,
        bytes32[] calldata dataHashes
    ) external;

    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================

    function getEmployee(address employee) external view returns (Employee memory);
    
    function getPayroll(uint256 payrollId) external view returns (PayrollRecord memory);
    
    function getEmployeePayrollIds(address employee) external view returns (uint256[] memory);
}