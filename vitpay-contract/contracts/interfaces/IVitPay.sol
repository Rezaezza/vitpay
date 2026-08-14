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

    event BusinessRegistered(
    address indexed businessOwner,
    string companyName
);

event BusinessUpdated(
    address indexed businessOwner,
    string companyName
);

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

    function registerBusiness(
    string calldata companyName
) external;

function updateBusiness(
    string calldata companyName,
    string calldata legalName,
    string calldata email,
    string calldata website,
    string calldata logoURI,
    string calldata country
) external;

    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================

    function getBusiness(
    address wallet
)
    external
    view
    returns (Business memory);
    
    function getEmployee(
    address employer,
    address employee
)
    external
    view
    returns (Employee memory);
    
    function getPayroll(uint256 payrollId) external view returns (PayrollRecord memory);
    
    function getEmployeePayrollIds(
    address employer,
    address employee
)
    external
    view
    returns (uint256[] memory);
}