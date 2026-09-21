// src/utils/saltStorage.ts
// Utility untuk menyimpan dan mengambil Secret Salt per transaksi
// Salt dienkripsi ringan dengan XOR pakai wallet address sebelum disimpan di localStorage
// Tujuan: salt tidak plain text di storage, bukan untuk keamanan kriptografis penuh

const STORAGE_KEY = "vitpay_salts";

export interface SavedSalt {
  txHash: string;        // dataHash dari blockchain (identifier unik)
  encryptedSalt: string; // salt yang sudah di-XOR encode
  employeeAddress: string;
  amount: string;
  timestamp: number;
  network: string;       // "arcTestnet" | "arcMainnet"
}

// Enkripsi ringan: XOR setiap karakter salt dengan karakter wallet address
function xorEncode(text: string, key: string): string {
  if (!key || key.length === 0) return text;
  return Array.from(text)
    .map((char, i) => {
      const keyChar = key[i % key.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    })
    .join("");
}

// Encode ke base64 supaya aman disimpan di localStorage
function encode(text: string, walletAddress: string): string {
  const xored = xorEncode(text, walletAddress.toLowerCase());
  return btoa(unescape(encodeURIComponent(xored)));
}

// Decode dari base64 dan XOR balik
function decode(encoded: string, walletAddress: string): string {
  try {
    const xored = decodeURIComponent(escape(atob(encoded)));
    return xorEncode(xored, walletAddress.toLowerCase());
  } catch {
    return "";
  }
}

// Simpan salt untuk transaksi tertentu
export function saveSalt(
  txHash: string,
  salt: string,
  walletAddress: string,
  employeeAddress: string,
  amount: string,
  network: string
): void {
  const all = getAllSalts();
  // Hindari duplikat
  const existing = all.findIndex((s) => s.txHash === txHash);
  const entry: SavedSalt = {
    txHash,
    encryptedSalt: encode(salt, walletAddress),
    employeeAddress,
    amount,
    timestamp: Date.now(),
    network,
  };
  if (existing >= 0) {
    all[existing] = entry;
  } else {
    all.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// Ambil semua salt yang tersimpan
export function getAllSalts(): SavedSalt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Ambil salt untuk txHash tertentu dan decrypt
export function getSaltForTx(txHash: string, walletAddress: string): string | null {
  const all = getAllSalts();
  const entry = all.find((s) => s.txHash === txHash);
  if (!entry) return null;
  return decode(entry.encryptedSalt, walletAddress);
}

// Hapus salt tertentu
export function deleteSalt(txHash: string): void {
  const all = getAllSalts().filter((s) => s.txHash !== txHash);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
