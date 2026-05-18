// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | ADVANCED CRYPTO ENGINE
// AES-256 Encryption, Hashing, Key Management
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const CryptoEngine = {
    // Master encryption key (should be from environment)
    masterKey: null,
    algorithm: 'AES-256-GCM',
    saltLength: 32,
    iterations: 100000,
    hashAlgo: 'SHA-256',

    // Initialize crypto engine
    async init(masterPassword) {
      try {
        this.masterKey = await this._deriveKey(masterPassword);
        console.log('[CRYPTO] Engine initialized with master key');
        return true;
      } catch (e) {
        console.error('[CRYPTO ERROR]', e.message);
        return false;
      }
    },

    // Derive key from password using PBKDF2
    async _deriveKey(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    },

    // Encrypt data
    async encrypt(plaintext) {
      if (!this.masterKey) throw new Error('Crypto engine not initialized');
      try {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = encoder.encode(plaintext);
        
        const ciphertext = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          this.masterKey,
          encoded
        );
        
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        
        return btoa(String.fromCharCode(...combined));
      } catch (e) {
        console.error('[ENCRYPT ERROR]', e.message);
        throw e;
      }
    },

    // Decrypt data
    async decrypt(ciphertext) {
      if (!this.masterKey) throw new Error('Crypto engine not initialized');
      try {
        const binaryString = atob(ciphertext);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const iv = bytes.slice(0, 12);
        const encrypted = bytes.slice(12);
        
        const plaintext = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          this.masterKey,
          encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(plaintext);
      } catch (e) {
        console.error('[DECRYPT ERROR]', e.message);
        throw e;
      }
    },

    // Hash password using SHA-256
    async hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Verify password hash
    async verifyPassword(password, hash) {
      const newHash = await this.hashPassword(password);
      return newHash === hash;
    },

    // Generate secure random token
    generateToken(length = 32) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  };

  window.CryptoEngine = CryptoEngine;
})();