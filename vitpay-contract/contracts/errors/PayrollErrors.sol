// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VitPay Payroll Errors
/// @notice Kumpulan custom errors gas-optimized untuk seluruh sistem VitPay
interface PayrollErrors {
    /// @notice Mencegah input address(0)
    error ZeroAddress();
    
    /// @notice Mencegah jumlah transfer atau salary 0
    error InvalidAmount();
    
    /// @notice Hash untuk confidential data tidak valid atau kosong
    error InvalidHash();
    
    /// @notice Terjadi saat mencoba mendaftarkan wallet yang sudah ada
    error EmployeeAlreadyExists();
    
    /// @notice Terjadi saat mencoba akses data employee yang belum terdaftar
    error EmployeeNotFound();
    
    /// @notice Employee sedang di-suspend atau terminated
    error EmployeeInactive();
    
    /// @notice ID Payroll tidak ditemukan di storage
    error PayrollNotFound();
    
    /// @notice Akses ditolak (bukan Owner/Employer)
    error Unauthorized();
    
    /// @notice Transfer USDC gagal (allowance kurang atau saldo tidak cukup)
    error TransferFailed();
    
    /// @notice Status transisi tidak diizinkan
    error InvalidStatus();
    
    /// @notice Array input batch payroll tidak sama panjang
    error LengthMismatch();
    
    /// @notice Array input kosong
    error ArrayEmpty();
}