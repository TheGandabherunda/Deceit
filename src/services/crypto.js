// Cryptographic utilities for Anti-Cheat commitments and secret sharing
import CryptoJS from 'crypto-js';

/**
 * Generate a cryptographically secure random salt in hex.
 */
export const generateSalt = (bytes = 16) => {
  const array = new Uint8Array(bytes);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
  cryptoObj.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};


/**
 * Compute SHA-256 hash of a string.
 */
export const sha256 = (message) => {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
};

/**
 * Create a commitment for a specific card.
 * Format: cardId:rank:salt
 */
export const createCardCommitment = (card) => {
  const payload = `${card.id}:${card.rank}:${card.salt}`;
  return sha256(payload);
};

/**
 * Verify that a revealed card matches a previously broadcasted hash commitment.
 */
export const verifyCardCommitment = (card, expectedHash) => {
  if (!card || !expectedHash) return false;
  const actualHash = createCardCommitment(card);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
};

/**
 * Simple symmetric encryption for sending a player's private hand across public relays.
 * The key is derived from a shared secret or a room-specific salt + recipient pubkey.
 */
export const encryptHand = (handData, recipientPubkey, hostSecret) => {
  const secretKey = sha256(`${recipientPubkey}:${hostSecret}`);
  return CryptoJS.AES.encrypt(JSON.stringify(handData), secretKey).toString();
};

/**
 * Decrypt a player's private hand using recipient pubkey and host secret.
 */
export const decryptHand = (encryptedCiphertext, recipientPubkey, hostSecret) => {
  try {
    const secretKey = sha256(`${recipientPubkey}:${hostSecret}`);
    const bytes = CryptoJS.AES.decrypt(encryptedCiphertext, secretKey);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (err) {
    console.error('[Crypto] Failed to decrypt hand:', err);
    return null;
  }
};
