// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IVitPay} from "./interfaces/IVitPay.sol";

/// @title ConfidentialPayroll
/// @notice Core contract for VitPay handling confidential USDC payrolls
contract ConfidentialPayroll is IVitPay, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ==========================================
    // STATE VARIABLES
    // ==========================================
    
    IERC20 public immutable usdc;
    address public treasury;

    // ==========================================
// BUSINESS REGISTRY
// ==========================================

uint256 private _businessCounter;

mapping(address => Business) private _businesses;
mapping(uint256 => address) private _businessOwners;

    uint256 private _payrollCounter;
    uint256 private _employeeCounter;

    mapping(address => mapping(address => Employee)) private _employees;
    mapping(uint256 => PayrollRecord) private _payrolls;

    mapping(address => uint256[])
private _employerPayrollIds;

    mapping(address => mapping(address => uint256[]))
    private _employeePayrollIds;
    mapping(address => bool) public isEmployer;

    mapping(address => PayrollStatistics)
private _employerStatistics;

    // ==========================================
    // MODIFIERS
    // ==========================================

    modifier onlyEmployer() {
        if (!isEmployer[msg.sender] && msg.sender != owner()) {
            revert Unauthorized();
        }
        _;
    }

    modifier validEmployee(address employee) {
        if (!_employees[msg.sender][employee].exists) revert EmployeeNotFound();
        if (
    _employees[msg.sender][employee].status != EmployeeStatus.ACTIVE
     ) revert EmployeeInactive();
        _;
    }

  // ==========================================
    // CONSTRUCTOR
    // ==========================================
  
   constructor(address initialOwner, address usdcAddress) Ownable(initialOwner) {
    if (initialOwner == address(0) || usdcAddress == address(0)) {
        revert ZeroAddress();
    }

    usdc = IERC20(usdcAddress);
    treasury = initialOwner;
    isEmployer[initialOwner] = true;

    // Register owner sebagai Business pertama
    _businessCounter = 1;

    _businesses[initialOwner] = Business({
        id: 1,
        companyName: "VitPay",
        legalName: "VitPay",
        email: "",
        website: "",
        logoURI: "",
        country: "",
        verified: true,
        createdAt: block.timestamp
    });

    _businessOwners[1] = initialOwner;
}

    // ==========================================
    // ADMIN FUNCTIONS
    // ==========================================

    function registerBusiness(
    string calldata companyName
) external {

    if (bytes(companyName).length == 0)
        revert InvalidBusinessName();

    if (isEmployer[msg.sender])
        revert BusinessAlreadyExists();

    _businessCounter++;

    isEmployer[msg.sender] = true;

    _businesses[msg.sender] = Business({
        id: _businessCounter,
        companyName: companyName,
        legalName: "",
        email: "",
        website: "",
        logoURI: "",
        country: "",
        verified: false,
        createdAt: block.timestamp
    });

    _businessOwners[_businessCounter] = msg.sender;

    emit BusinessRegistered(
        msg.sender,
        companyName
    );
}
    
    function setEmployer(address employer, bool status) external onlyOwner {
        if (employer == address(0)) revert ZeroAddress();
        isEmployer[employer] = status;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function updateBusiness(
    string calldata companyName,
    string calldata legalName,
    string calldata email,
    string calldata website,
    string calldata logoURI,
    string calldata country
) external onlyEmployer {

    Business storage business = _businesses[msg.sender];

    business.companyName = companyName;
    business.legalName = legalName;
    business.email = email;
    business.website = website;
    business.logoURI = logoURI;
    business.country = country;

    emit BusinessUpdated(
        msg.sender,
        companyName
    );
}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ==========================================
    // EMPLOYEE MANAGEMENT
    // ==========================================

    function registerEmployee(
        address wallet,
        string calldata employeeId,
        string calldata name
    ) external onlyEmployer {
        if (wallet == address(0)) revert ZeroAddress();
        if (_employees[msg.sender][wallet].exists)
    revert EmployeeAlreadyExists();

        _employees[msg.sender][wallet] = Employee({
            wallet: wallet,
            employeeId: employeeId,
            name: name,
            exists: true,
            status: EmployeeStatus.ACTIVE,
            createdAt: block.timestamp
        });

  _employerStatistics[msg.sender].totalEmployees++;

        emit EmployeeRegistered(wallet, employeeId, name);
    }

    function updateEmployeeStatus(
        address employee,
        EmployeeStatus status
    ) external onlyEmployer {
        if (!_employees[msg.sender][employee].exists) revert EmployeeNotFound();
        
        _employees[msg.sender][employee].status = status;
        emit EmployeeStatusUpdated(employee, status);
    }

    // ==========================================
    // PAYROLL CORE
    // ==========================================

    function paySalary(
        address employee,
        uint256 amount,
        bytes32 dataHash
    ) public onlyEmployer whenNotPaused nonReentrant validEmployee(employee) {
        if (amount == 0) revert InvalidAmount();
        if (dataHash == bytes32(0)) revert InvalidHash();

        // Transfer USDC dari Employer ke Employee menggunakan SafeERC20
        usdc.safeTransferFrom(msg.sender, employee, amount);

        // Increment counter ID
        _payrollCounter++;
        uint256 currentId = _payrollCounter;

        // Record Payroll
        _payrolls[currentId] = PayrollRecord({
            id: currentId,
            employer: msg.sender,
            employee: employee,
            amount: amount,
            dataHash: dataHash,
            status: PayrollStatus.COMPLETED,
            timestamp: block.timestamp
        });

        // Mapping array ID untuk employee
        _employeePayrollIds[msg.sender][employee].push(currentId);

        // Update Global Stats
 _employerStatistics[msg.sender].totalPayrolls++;

_employerStatistics[msg.sender].totalAmountPaid += amount;

_employerPayrollIds[msg.sender].push(currentId);

        emit SalaryPaid(currentId, msg.sender, employee, amount, dataHash);
    }

    function batchPaySalary(
        address[] calldata employees,
        uint256[] calldata amounts,
        bytes32[] calldata dataHashes
    ) external onlyEmployer whenNotPaused nonReentrant {
        uint256 length = employees.length;
        if (length == 0) revert ArrayEmpty();
        if (length != amounts.length || length != dataHashes.length) revert LengthMismatch();

        for (uint256 i = 0; i < length; i++) {
            address emp = employees[i];
            uint256 amt = amounts[i];
            bytes32 hash = dataHashes[i];

           if (!_employees[msg.sender][emp].exists)
    revert EmployeeNotFound();

if (
    _employees[msg.sender][emp].status != EmployeeStatus.ACTIVE
)
    revert EmployeeInactive();
            if (amt == 0) revert InvalidAmount();
            if (hash == bytes32(0)) revert InvalidHash();

            usdc.safeTransferFrom(msg.sender, emp, amt);

            _payrollCounter++;
            uint256 currentId = _payrollCounter;

            _payrolls[currentId] = PayrollRecord({
                id: currentId,
                employer: msg.sender,
                employee: emp,
                amount: amt,
                dataHash: hash,
                status: PayrollStatus.COMPLETED,
                timestamp: block.timestamp
            });

            _employeePayrollIds[msg.sender][emp].push(currentId);
            _employerStatistics[msg.sender].totalAmountPaid += amt;

_employerPayrollIds[msg.sender].push(currentId);
            
            emit SalaryPaid(currentId, msg.sender, emp, amt, hash);
        }
        
        _employerStatistics[msg.sender].totalPayrolls += length;
    }

    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================

    function getBusiness(
    address wallet
)
external
view
returns (Business memory)
{
    return _businesses[wallet];
}
    
    function getEmployee(
    address employer,
    address employee
) external view returns (Employee memory) {
        if (!_employees[employer][employee].exists) revert EmployeeNotFound();
        return _employees[employer][employee];
    }

    function getPayroll(uint256 payrollId) external view returns (PayrollRecord memory) {
        if (payrollId == 0 || payrollId > _payrollCounter) revert PayrollNotFound();
        return _payrolls[payrollId];
    }

    function getEmployeePayrollIds(
    address employer,
    address employee
) external view returns (uint256[] memory) {
        return _employeePayrollIds[employer][employee];
    }


function getEmployerPayrollIds(
    address employer
)
external
view
returns (uint256[] memory)
{
    return _employerPayrollIds[employer];
}


  function getStatistics(
    address employer
)
external
view
returns (PayrollStatistics memory)
{
    return _employerStatistics[employer];
}

}