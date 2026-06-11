// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VitPay Hashing Library
/// @notice Library murni (pure) untuk menghasilkan dan memverifikasi confidential hash
library Hashing {
    
    /// @notice Menghasilkan hash unik untuk data gaji rahasia
    /// @param employee Alamat wallet pegawai
    /// @param amount Jumlah USDC yang dikirim (dalam desimal 6)
    /// @param secretSalt Salt acak/rahasia dari frontend untuk mencegah rainbow table attack
    /// @return bytes32 Hash data yang akan dicatat di blockchain Arc
    function generatePayrollHash(
        address employee,
        uint256 amount,
        string memory secretSalt
    ) internal pure returns (bytes32) {
        // Menggabungkan data dan melakukan hashing satu arah
        return keccak256(abi.encodePacked(employee, amount, secretSalt));
    }

    /// @notice Memverifikasi apakah data hash cocok dengan data aslinya
    /// @dev Dipanggil jika ada sengketa atau audit internal (opsional)
    function verifyHash(
        bytes32 dataHash,
        address employee,
        uint256 amount,
        string memory secretSalt
    ) internal pure returns (bool) {
        return dataHash == generatePayrollHash(employee, amount, secretSalt);
    }
}