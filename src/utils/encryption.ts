import { Buffer } from 'buffer';

const ENCRYPTION_KEY = (import.meta.env.VITE_ENCRYPTION_KEY || 'HBnKcgsxvvXuCoEGasc7CjXhUDpijDif') as string;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}

export const encryptPassword = async (password: string) => {
  try {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    // Convert the encryption key to a CryptoKey
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ENCRYPTION_KEY);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt']
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the password
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      key,
      encoder.encode(password)
    );

    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw error;
  }
};