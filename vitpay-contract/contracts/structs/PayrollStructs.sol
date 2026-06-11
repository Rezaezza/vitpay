// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VitPay Payroll Structs
/// @notice Struktur data utama untuk VitPay Confidential Payroll
interface PayrollStructs {
    
    enum EmployeeStatus {
        NONE,
        ACTIVE,
        SUSPENDED,
        TERMINATED
    }

    enum PayrollStatus {
        PENDING,
        COMPLETED,
        CANCELLED
    }

    struct Employee {
        address wallet;
        string employeeId;
        string name;
        bool exists;
        EmployeeStatus status;
        uint256 createdAt;
    }

    struct PayrollRecord {
        uint256 id;
        address employer;
        address employee;
        uint256 amount;
        bytes32 dataHash;
        PayrollStatus status;
        uint256 timestamp;
    }

    struct PayrollStatistics {
        uint256 totalEmployees;
        uint256 totalPayrolls;
        uint256 totalAmountPaid;
    }
}