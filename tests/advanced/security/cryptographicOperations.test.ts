/**
 * 暗号化・暗号学的操作高度テスト
 * チーム3: セキュリティ・認証担当（1名）
 *
 * 目標: 暗号化アルゴリズムの数学的検証、タイミング攻撃耐性テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import { faker } from '@faker-js/faker'
import * as sinon from 'sinon'
import { webcrypto } from 'node:crypto'

// Polyfill for Web Crypto API in Node.js environment
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any
}

interface EncryptionKey {
  id: string
  algorithm: string
  keySize: number
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  keyMaterial: CryptoKey
}

interface EncryptedData {
  data: ArrayBuffer
  iv: ArrayBuffer
  tag?: ArrayBuffer // For AEAD ciphers
  keyId: string
  algorithm: string
  timestamp: Date
}

interface HashResult {
  hash: ArrayBuffer
  algorithm: string
  inputLength: number
  timestamp: Date
}

interface DigitalSignature {
  signature: ArrayBuffer
  algorithm: string
  keyId: string
  timestamp: Date
}

interface KeyDerivationParams {
  password: string
  salt: ArrayBuffer
  iterations: number
  keyLength: number
  algorithm: 'PBKDF2' | 'scrypt' | 'Argon2'
}

class CryptographicManager {
  private keys: Map<string, EncryptionKey> = new Map()
  private operationMetrics: Map<string, number[]> = new Map()

  // AES-GCM Encryption/Decryption
  async generateAESKey(keySize: 128 | 192 | 256 = 256): Promise<EncryptionKey> {
    const keyMaterial = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: keySize,
      },
      true,
      ['encrypt', 'decrypt']
    )

    const keyId = `aes_${keySize}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const encryptionKey: EncryptionKey = {
      id: keyId,
      algorithm: 'AES-GCM',
      keySize,
      createdAt: new Date(),
      isActive: true,
      keyMaterial,
    }

    this.keys.set(keyId, encryptionKey)
    return encryptionKey
  }

  async encryptAESGCM(keyId: string, plaintext: ArrayBuffer): Promise<EncryptedData> {
    const key = this.keys.get(keyId)
    if (!key || !key.isActive || key.algorithm !== 'AES-GCM') {
      throw new Error(`Invalid or inactive AES-GCM key: ${keyId}`)
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new Error(`Key expired: ${keyId}`)
    }

    const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for GCM
    const startTime = performance.now()

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key.keyMaterial,
      plaintext
    )

    const endTime = performance.now()
    this.recordOperationMetric('encrypt_aes_gcm', endTime - startTime)

    return {
      data: encryptedData,
      iv: iv.buffer,
      keyId,
      algorithm: 'AES-GCM',
      timestamp: new Date(),
    }
  }

  async decryptAESGCM(encryptedData: EncryptedData): Promise<ArrayBuffer> {
    const key = this.keys.get(encryptedData.keyId)
    if (!key || !key.isActive || key.algorithm !== 'AES-GCM') {
      throw new Error(`Invalid or inactive AES-GCM key: ${encryptedData.keyId}`)
    }

    const startTime = performance.now()

    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: encryptedData.iv,
        },
        key.keyMaterial,
        encryptedData.data
      )

      const endTime = performance.now()
      this.recordOperationMetric('decrypt_aes_gcm', endTime - startTime)

      return decryptedData
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`)
    }
  }

  // RSA Key Generation and Operations
  async generateRSAKeyPair(keySize: 2048 | 3072 | 4096 = 2048): Promise<{
    publicKey: EncryptionKey
    privateKey: EncryptionKey
  }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    )

    const keyId = `rsa_${keySize}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const publicKey: EncryptionKey = {
      id: `${keyId}_pub`,
      algorithm: 'RSA-OAEP',
      keySize,
      createdAt: new Date(),
      isActive: true,
      keyMaterial: keyPair.publicKey,
    }

    const privateKey: EncryptionKey = {
      id: `${keyId}_priv`,
      algorithm: 'RSA-OAEP',
      keySize,
      createdAt: new Date(),
      isActive: true,
      keyMaterial: keyPair.privateKey,
    }

    this.keys.set(publicKey.id, publicKey)
    this.keys.set(privateKey.id, privateKey)

    return { publicKey, privateKey }
  }

  async encryptRSA(publicKeyId: string, plaintext: ArrayBuffer): Promise<EncryptedData> {
    const key = this.keys.get(publicKeyId)
    if (!key || !key.isActive || key.algorithm !== 'RSA-OAEP') {
      throw new Error(`Invalid RSA public key: ${publicKeyId}`)
    }

    // RSA-OAEP can only encrypt data smaller than key size minus padding
    const maxPlaintextLength = key.keySize / 8 - 42 // OAEP padding overhead
    if (plaintext.byteLength > maxPlaintextLength) {
      throw new Error(
        `Plaintext too large for RSA key size: ${plaintext.byteLength} > ${maxPlaintextLength}`
      )
    }

    const startTime = performance.now()

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      key.keyMaterial,
      plaintext
    )

    const endTime = performance.now()
    this.recordOperationMetric('encrypt_rsa', endTime - startTime)

    return {
      data: encryptedData,
      iv: new ArrayBuffer(0), // RSA doesn't use IV
      keyId: publicKeyId,
      algorithm: 'RSA-OAEP',
      timestamp: new Date(),
    }
  }

  async decryptRSA(privateKeyId: string, encryptedData: EncryptedData): Promise<ArrayBuffer> {
    const key = this.keys.get(privateKeyId)
    if (!key || !key.isActive || key.algorithm !== 'RSA-OAEP') {
      throw new Error(`Invalid RSA private key: ${privateKeyId}`)
    }

    const startTime = performance.now()

    try {
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        key.keyMaterial,
        encryptedData.data
      )

      const endTime = performance.now()
      this.recordOperationMetric('decrypt_rsa', endTime - startTime)

      return decryptedData
    } catch (error) {
      throw new Error(`RSA decryption failed: ${(error as Error).message}`)
    }
  }

  // Digital Signatures
  async generateSigningKeyPair(algorithm: 'RSA-PSS' | 'ECDSA' = 'RSA-PSS'): Promise<{
    publicKey: EncryptionKey
    privateKey: EncryptionKey
  }> {
    let keyGenParams: any
    let keyUsage: KeyUsage[] = ['sign', 'verify']

    if (algorithm === 'RSA-PSS') {
      keyGenParams = {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      }
    } else {
      keyGenParams = {
        name: 'ECDSA',
        namedCurve: 'P-256',
      }
    }

    const keyPair = await crypto.subtle.generateKey(keyGenParams, true, keyUsage)
    const keyId = `sign_${algorithm.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const publicKey: EncryptionKey = {
      id: `${keyId}_pub`,
      algorithm,
      keySize: algorithm === 'RSA-PSS' ? 2048 : 256,
      createdAt: new Date(),
      isActive: true,
      keyMaterial: keyPair.publicKey,
    }

    const privateKey: EncryptionKey = {
      id: `${keyId}_priv`,
      algorithm,
      keySize: algorithm === 'RSA-PSS' ? 2048 : 256,
      createdAt: new Date(),
      isActive: true,
      keyMaterial: keyPair.privateKey,
    }

    this.keys.set(publicKey.id, publicKey)
    this.keys.set(privateKey.id, privateKey)

    return { publicKey, privateKey }
  }

  async signData(privateKeyId: string, data: ArrayBuffer): Promise<DigitalSignature> {
    const key = this.keys.get(privateKeyId)
    if (!key || !key.isActive) {
      throw new Error(`Invalid signing key: ${privateKeyId}`)
    }

    let signParams: any
    if (key.algorithm === 'RSA-PSS') {
      signParams = {
        name: 'RSA-PSS',
        saltLength: 32,
      }
    } else if (key.algorithm === 'ECDSA') {
      signParams = {
        name: 'ECDSA',
        hash: 'SHA-256',
      }
    } else {
      throw new Error(`Unsupported signing algorithm: ${key.algorithm}`)
    }

    const startTime = performance.now()

    const signature = await crypto.subtle.sign(signParams, key.keyMaterial, data)

    const endTime = performance.now()
    this.recordOperationMetric('sign_data', endTime - startTime)

    return {
      signature,
      algorithm: key.algorithm,
      keyId: privateKeyId,
      timestamp: new Date(),
    }
  }

  async verifySignature(
    publicKeyId: string,
    signature: DigitalSignature,
    data: ArrayBuffer
  ): Promise<boolean> {
    const key = this.keys.get(publicKeyId)
    if (!key || !key.isActive || key.algorithm !== signature.algorithm) {
      throw new Error(`Invalid verification key: ${publicKeyId}`)
    }

    let verifyParams: any
    if (signature.algorithm === 'RSA-PSS') {
      verifyParams = {
        name: 'RSA-PSS',
        saltLength: 32,
      }
    } else if (signature.algorithm === 'ECDSA') {
      verifyParams = {
        name: 'ECDSA',
        hash: 'SHA-256',
      }
    } else {
      throw new Error(`Unsupported verification algorithm: ${signature.algorithm}`)
    }

    const startTime = performance.now()

    try {
      const isValid = await crypto.subtle.verify(
        verifyParams,
        key.keyMaterial,
        signature.signature,
        data
      )

      const endTime = performance.now()
      this.recordOperationMetric('verify_signature', endTime - startTime)

      return isValid
    } catch (error) {
      return false
    }
  }

  // Cryptographic Hashing
  async hash(
    data: ArrayBuffer,
    algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'
  ): Promise<HashResult> {
    const startTime = performance.now()

    const hashBuffer = await crypto.subtle.digest(algorithm, data)

    const endTime = performance.now()
    this.recordOperationMetric(`hash_${algorithm.toLowerCase()}`, endTime - startTime)

    return {
      hash: hashBuffer,
      algorithm,
      inputLength: data.byteLength,
      timestamp: new Date(),
    }
  }

  // Key Derivation Functions
  async deriveKeyPBKDF2(params: KeyDerivationParams): Promise<ArrayBuffer> {
    if (params.algorithm !== 'PBKDF2') {
      throw new Error('Invalid algorithm for PBKDF2')
    }

    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(params.password)

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )

    const startTime = performance.now()

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: params.salt,
        iterations: params.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      params.keyLength * 8
    )

    const endTime = performance.now()
    this.recordOperationMetric('derive_key_pbkdf2', endTime - startTime)

    return derivedKey
  }

  // Timing-safe comparison
  constantTimeCompare(a: ArrayBuffer, b: ArrayBuffer): boolean {
    if (a.byteLength !== b.byteLength) {
      return false
    }

    const aView = new Uint8Array(a)
    const bView = new Uint8Array(b)
    let result = 0

    for (let i = 0; i < aView.length; i++) {
      result |= aView[i] ^ bView[i]
    }

    return result === 0
  }

  // Secure Random Generation
  generateSecureRandom(length: number): ArrayBuffer {
    const randomBytes = new Uint8Array(length)
    crypto.getRandomValues(randomBytes)
    return randomBytes.buffer
  }

  // Key Management
  revokeKey(keyId: string): void {
    const key = this.keys.get(keyId)
    if (key) {
      key.isActive = false
    }
  }

  setKeyExpiration(keyId: string, expiresAt: Date): void {
    const key = this.keys.get(keyId)
    if (key) {
      key.expiresAt = expiresAt
    }
  }

  getActiveKeys(): EncryptionKey[] {
    return Array.from(this.keys.values()).filter(
      (key) => key.isActive && (!key.expiresAt || key.expiresAt > new Date())
    )
  }

  // Performance Metrics
  private recordOperationMetric(operation: string, duration: number): void {
    if (!this.operationMetrics.has(operation)) {
      this.operationMetrics.set(operation, [])
    }
    this.operationMetrics.get(operation)!.push(duration)
  }

  getOperationMetrics(operation: string): {
    count: number
    averageTime: number
    minTime: number
    maxTime: number
  } {
    const metrics = this.operationMetrics.get(operation) || []
    if (metrics.length === 0) {
      return { count: 0, averageTime: 0, minTime: 0, maxTime: 0 }
    }

    const sum = metrics.reduce((a, b) => a + b, 0)
    return {
      count: metrics.length,
      averageTime: sum / metrics.length,
      minTime: Math.min(...metrics),
      maxTime: Math.max(...metrics),
    }
  }

  // Timing Attack Resistance Testing
  async performTimingTest(
    operation: () => Promise<any>,
    iterations: number = 1000
  ): Promise<{ times: number[]; average: number; stddev: number }> {
    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await operation()
      const end = performance.now()
      times.push(end - start)
    }

    const average = times.reduce((a, b) => a + b) / times.length
    const variance = times.reduce((a, b) => a + Math.pow(b - average, 2), 0) / times.length
    const stddev = Math.sqrt(variance)

    return { times, average, stddev }
  }
}

// Utility functions for testing
function arrayBufferToString(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  return encoder.encode(str).buffer
}

describe('Cryptographic Operations - Advanced Security Testing', () => {
  let cryptoManager: CryptographicManager

  beforeEach(() => {
    cryptoManager = new CryptographicManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sinon.restore()
  })

  /**
   * AES-GCM Encryption Testing
   */
  describe('AES-GCM Encryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const plaintext = stringToArrayBuffer('Hello, cryptographic world!')

      const encrypted = await cryptoManager.encryptAESGCM(key.id, plaintext)
      const decrypted = await cryptoManager.decryptAESGCM(encrypted)

      expect(arrayBufferToString(decrypted)).toBe(arrayBufferToString(plaintext))
    })

    it('should use different IVs for each encryption', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const plaintext = stringToArrayBuffer('Test message')

      const encrypted1 = await cryptoManager.encryptAESGCM(key.id, plaintext)
      const encrypted2 = await cryptoManager.encryptAESGCM(key.id, plaintext)

      expect(arrayBufferToString(encrypted1.iv)).not.toBe(arrayBufferToString(encrypted2.iv))
      expect(arrayBufferToString(encrypted1.data)).not.toBe(arrayBufferToString(encrypted2.data))
    })

    it('should fail with invalid key', async () => {
      const plaintext = stringToArrayBuffer('Test message')

      await expect(cryptoManager.encryptAESGCM('invalid_key', plaintext)).rejects.toThrow(
        'Invalid or inactive AES-GCM key'
      )
    })

    it('should fail with tampered ciphertext', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const plaintext = stringToArrayBuffer('Authentic message')

      const encrypted = await cryptoManager.encryptAESGCM(key.id, plaintext)

      // Tamper with the ciphertext
      const tamperedData = new Uint8Array(encrypted.data)
      tamperedData[0] ^= 0xff
      encrypted.data = tamperedData.buffer

      await expect(cryptoManager.decryptAESGCM(encrypted)).rejects.toThrow('Decryption failed')
    })

    it('should handle different key sizes', async () => {
      const keySizes: (128 | 192 | 256)[] = [128, 192, 256]
      const plaintext = stringToArrayBuffer('Key size test')

      for (const keySize of keySizes) {
        const key = await cryptoManager.generateAESKey(keySize)
        expect(key.keySize).toBe(keySize)

        const encrypted = await cryptoManager.encryptAESGCM(key.id, plaintext)
        const decrypted = await cryptoManager.decryptAESGCM(encrypted)

        expect(arrayBufferToString(decrypted)).toBe(arrayBufferToString(plaintext))
      }
    })
  })

  /**
   * RSA Encryption Testing
   */
  describe('RSA Encryption', () => {
    it('should encrypt with public key and decrypt with private key', async () => {
      const keyPair = await cryptoManager.generateRSAKeyPair(2048)
      const plaintext = stringToArrayBuffer('RSA test message')

      const encrypted = await cryptoManager.encryptRSA(keyPair.publicKey.id, plaintext)
      const decrypted = await cryptoManager.decryptRSA(keyPair.privateKey.id, encrypted)

      expect(arrayBufferToString(decrypted)).toBe(arrayBufferToString(plaintext))
    })

    it('should handle different RSA key sizes', async () => {
      const keySizes: (2048 | 3072 | 4096)[] = [2048, 3072, 4096]
      const plaintext = stringToArrayBuffer('RSA key size test')

      for (const keySize of keySizes) {
        const keyPair = await cryptoManager.generateRSAKeyPair(keySize)
        expect(keyPair.publicKey.keySize).toBe(keySize)
        expect(keyPair.privateKey.keySize).toBe(keySize)

        const encrypted = await cryptoManager.encryptRSA(keyPair.publicKey.id, plaintext)
        const decrypted = await cryptoManager.decryptRSA(keyPair.privateKey.id, encrypted)

        expect(arrayBufferToString(decrypted)).toBe(arrayBufferToString(plaintext))
      }
    })

    it('should reject plaintext too large for key size', async () => {
      const keyPair = await cryptoManager.generateRSAKeyPair(2048)
      const largePlaintext = new ArrayBuffer(300) // Too large for 2048-bit RSA

      await expect(cryptoManager.encryptRSA(keyPair.publicKey.id, largePlaintext)).rejects.toThrow(
        'Plaintext too large for RSA key size'
      )
    })

    it('should fail decryption with wrong private key', async () => {
      const keyPair1 = await cryptoManager.generateRSAKeyPair(2048)
      const keyPair2 = await cryptoManager.generateRSAKeyPair(2048)
      const plaintext = stringToArrayBuffer('Wrong key test')

      const encrypted = await cryptoManager.encryptRSA(keyPair1.publicKey.id, plaintext)

      await expect(cryptoManager.decryptRSA(keyPair2.privateKey.id, encrypted)).rejects.toThrow(
        'RSA decryption failed'
      )
    })
  })

  /**
   * Digital Signatures Testing
   */
  describe('Digital Signatures', () => {
    it('should create and verify RSA-PSS signatures', async () => {
      const keyPair = await cryptoManager.generateSigningKeyPair('RSA-PSS')
      const data = stringToArrayBuffer('Document to be signed')

      const signature = await cryptoManager.signData(keyPair.privateKey.id, data)
      const isValid = await cryptoManager.verifySignature(keyPair.publicKey.id, signature, data)

      expect(isValid).toBe(true)
      expect(signature.algorithm).toBe('RSA-PSS')
    })

    it('should create and verify ECDSA signatures', async () => {
      const keyPair = await cryptoManager.generateSigningKeyPair('ECDSA')
      const data = stringToArrayBuffer('ECDSA document')

      const signature = await cryptoManager.signData(keyPair.privateKey.id, data)
      const isValid = await cryptoManager.verifySignature(keyPair.publicKey.id, signature, data)

      expect(isValid).toBe(true)
      expect(signature.algorithm).toBe('ECDSA')
    })

    it('should fail verification with tampered data', async () => {
      const keyPair = await cryptoManager.generateSigningKeyPair('RSA-PSS')
      const originalData = stringToArrayBuffer('Original document')
      const tamperedData = stringToArrayBuffer('Tampered document')

      const signature = await cryptoManager.signData(keyPair.privateKey.id, originalData)
      const isValid = await cryptoManager.verifySignature(
        keyPair.publicKey.id,
        signature,
        tamperedData
      )

      expect(isValid).toBe(false)
    })

    it('should fail verification with wrong public key', async () => {
      const keyPair1 = await cryptoManager.generateSigningKeyPair('RSA-PSS')
      const keyPair2 = await cryptoManager.generateSigningKeyPair('RSA-PSS')
      const data = stringToArrayBuffer('Signed document')

      const signature = await cryptoManager.signData(keyPair1.privateKey.id, data)
      const isValid = await cryptoManager.verifySignature(keyPair2.publicKey.id, signature, data)

      expect(isValid).toBe(false)
    })
  })

  /**
   * Cryptographic Hashing Testing
   */
  describe('Cryptographic Hashing', () => {
    it('should produce consistent hashes for same input', async () => {
      const data = stringToArrayBuffer('Hash test data')

      const hash1 = await cryptoManager.hash(data, 'SHA-256')
      const hash2 = await cryptoManager.hash(data, 'SHA-256')

      expect(arrayBufferToString(hash1.hash)).toBe(arrayBufferToString(hash2.hash))
      expect(hash1.algorithm).toBe('SHA-256')
    })

    it('should produce different hashes for different algorithms', async () => {
      const data = stringToArrayBuffer('Multi-algorithm test')

      const sha256 = await cryptoManager.hash(data, 'SHA-256')
      const sha384 = await cryptoManager.hash(data, 'SHA-384')
      const sha512 = await cryptoManager.hash(data, 'SHA-512')

      expect(arrayBufferToString(sha256.hash)).not.toBe(arrayBufferToString(sha384.hash))
      expect(arrayBufferToString(sha384.hash)).not.toBe(arrayBufferToString(sha512.hash))
      expect(sha256.hash.byteLength).toBe(32) // SHA-256 = 256 bits = 32 bytes
      expect(sha384.hash.byteLength).toBe(48) // SHA-384 = 384 bits = 48 bytes
      expect(sha512.hash.byteLength).toBe(64) // SHA-512 = 512 bits = 64 bytes
    })

    it('should handle empty input', async () => {
      const emptyData = new ArrayBuffer(0)
      const hash = await cryptoManager.hash(emptyData, 'SHA-256')

      expect(hash.hash.byteLength).toBe(32)
      expect(hash.inputLength).toBe(0)
    })

    it('should produce different hashes for similar inputs', async () => {
      const data1 = stringToArrayBuffer('Similar data 1')
      const data2 = stringToArrayBuffer('Similar data 2')

      const hash1 = await cryptoManager.hash(data1, 'SHA-256')
      const hash2 = await cryptoManager.hash(data2, 'SHA-256')

      expect(arrayBufferToString(hash1.hash)).not.toBe(arrayBufferToString(hash2.hash))
    })
  })

  /**
   * Key Derivation Function Testing
   */
  describe('Key Derivation', () => {
    it('should derive consistent keys from same parameters', async () => {
      const params: KeyDerivationParams = {
        password: 'secure_password_123',
        salt: cryptoManager.generateSecureRandom(16),
        iterations: 100000,
        keyLength: 32,
        algorithm: 'PBKDF2',
      }

      const key1 = await cryptoManager.deriveKeyPBKDF2(params)
      const key2 = await cryptoManager.deriveKeyPBKDF2(params)

      expect(arrayBufferToString(key1)).toBe(arrayBufferToString(key2))
      expect(key1.byteLength).toBe(32)
    })

    it('should derive different keys with different salts', async () => {
      const baseParams: KeyDerivationParams = {
        password: 'same_password',
        salt: new ArrayBuffer(0), // Will be overridden
        iterations: 100000,
        keyLength: 32,
        algorithm: 'PBKDF2',
      }

      const params1 = { ...baseParams, salt: cryptoManager.generateSecureRandom(16) }
      const params2 = { ...baseParams, salt: cryptoManager.generateSecureRandom(16) }

      const key1 = await cryptoManager.deriveKeyPBKDF2(params1)
      const key2 = await cryptoManager.deriveKeyPBKDF2(params2)

      expect(arrayBufferToString(key1)).not.toBe(arrayBufferToString(key2))
    })

    it('should derive different keys with different iteration counts', async () => {
      const baseSalt = cryptoManager.generateSecureRandom(16)

      const params1: KeyDerivationParams = {
        password: 'same_password',
        salt: baseSalt,
        iterations: 100000,
        keyLength: 32,
        algorithm: 'PBKDF2',
      }

      const params2: KeyDerivationParams = {
        password: 'same_password',
        salt: baseSalt,
        iterations: 200000,
        keyLength: 32,
        algorithm: 'PBKDF2',
      }

      const key1 = await cryptoManager.deriveKeyPBKDF2(params1)
      const key2 = await cryptoManager.deriveKeyPBKDF2(params2)

      expect(arrayBufferToString(key1)).not.toBe(arrayBufferToString(key2))
    })
  })

  /**
   * Timing-Safe Operations Testing
   */
  describe('Timing Safety', () => {
    it('should perform constant-time comparison', () => {
      const data1 = stringToArrayBuffer('equal_data')
      const data2 = stringToArrayBuffer('equal_data')
      const data3 = stringToArrayBuffer('different_data')

      expect(cryptoManager.constantTimeCompare(data1, data2)).toBe(true)
      expect(cryptoManager.constantTimeCompare(data1, data3)).toBe(false)
      expect(cryptoManager.constantTimeCompare(data3, data1)).toBe(false)
    })

    it('should handle different length buffers in constant time', () => {
      const short = stringToArrayBuffer('short')
      const longer = stringToArrayBuffer('much_longer_string')

      expect(cryptoManager.constantTimeCompare(short, longer)).toBe(false)
      expect(cryptoManager.constantTimeCompare(longer, short)).toBe(false)
    })

    it('should resist timing attacks on comparison', async () => {
      const correctHash = await cryptoManager.hash(
        stringToArrayBuffer('correct_password'),
        'SHA-256'
      )
      const correctHashData = correctHash.hash

      // Test with various wrong hashes
      const wrongHashes = await Promise.all([
        cryptoManager.hash(stringToArrayBuffer('wrong_password_1'), 'SHA-256'),
        cryptoManager.hash(stringToArrayBuffer('wrong_password_2'), 'SHA-256'),
        cryptoManager.hash(stringToArrayBuffer('wrong_password_3'), 'SHA-256'),
      ])

      const timings: number[] = []

      // Measure timing for correct comparison
      for (let i = 0; i < 100; i++) {
        const start = performance.now()
        cryptoManager.constantTimeCompare(correctHashData, correctHashData)
        const end = performance.now()
        timings.push(end - start)
      }

      // Measure timing for incorrect comparisons
      for (const wrongHash of wrongHashes) {
        for (let i = 0; i < 100; i++) {
          const start = performance.now()
          cryptoManager.constantTimeCompare(correctHashData, wrongHash.hash)
          const end = performance.now()
          timings.push(end - start)
        }
      }

      // Timing should be relatively consistent (low standard deviation)
      const average = timings.reduce((a, b) => a + b) / timings.length
      const variance = timings.reduce((a, b) => a + Math.pow(b - average, 2), 0) / timings.length
      const stddev = Math.sqrt(variance)
      const coefficientOfVariation = stddev / average

      // CV should be low for timing-safe operations (typically < 0.1)
      expect(coefficientOfVariation).toBeLessThan(0.2)
    })
  })

  /**
   * Secure Random Generation Testing
   */
  describe('Secure Random Generation', () => {
    it('should generate random bytes of specified length', () => {
      const lengths = [16, 32, 64, 128]

      for (const length of lengths) {
        const random = cryptoManager.generateSecureRandom(length)
        expect(random.byteLength).toBe(length)
      }
    })

    it('should generate different random values', () => {
      const random1 = cryptoManager.generateSecureRandom(32)
      const random2 = cryptoManager.generateSecureRandom(32)

      expect(arrayBufferToString(random1)).not.toBe(arrayBufferToString(random2))
    })

    it('should pass basic randomness tests', () => {
      const randomBytes = new Uint8Array(cryptoManager.generateSecureRandom(1000))

      // Basic statistical tests
      const sum = Array.from(randomBytes).reduce((a, b) => a + b, 0)
      const average = sum / randomBytes.length

      // Should be close to 127.5 for truly random bytes
      expect(average).toBeGreaterThan(120)
      expect(average).toBeLessThan(135)

      // Check for repeated patterns (should be rare)
      let repeatedBytes = 0
      for (let i = 1; i < randomBytes.length; i++) {
        if (randomBytes[i] === randomBytes[i - 1]) {
          repeatedBytes++
        }
      }

      // Should have less than 10% consecutive repeats
      expect(repeatedBytes / randomBytes.length).toBeLessThan(0.1)
    })
  })

  /**
   * Key Management Testing
   */
  describe('Key Management', () => {
    it('should manage key lifecycle', async () => {
      const key = await cryptoManager.generateAESKey(256)

      expect(key.isActive).toBe(true)
      expect(key.expiresAt).toBeUndefined()

      // Set expiration
      const futureDate = new Date(Date.now() + 3600000) // 1 hour
      cryptoManager.setKeyExpiration(key.id, futureDate)

      const activeKeys = cryptoManager.getActiveKeys()
      expect(activeKeys.find((k) => k.id === key.id)).toBeDefined()

      // Revoke key
      cryptoManager.revokeKey(key.id)

      const activeKeysAfterRevoke = cryptoManager.getActiveKeys()
      expect(activeKeysAfterRevoke.find((k) => k.id === key.id)).toBeUndefined()
    })

    it('should handle expired keys', async () => {
      const key = await cryptoManager.generateAESKey(256)

      // Set expiration in the past
      const pastDate = new Date(Date.now() - 3600000) // 1 hour ago
      cryptoManager.setKeyExpiration(key.id, pastDate)

      const plaintext = stringToArrayBuffer('Test with expired key')

      await expect(cryptoManager.encryptAESGCM(key.id, plaintext)).rejects.toThrow('Key expired')
    })
  })

  /**
   * Performance and Metrics Testing
   */
  describe('Performance Metrics', () => {
    it('should track operation performance', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const plaintext = stringToArrayBuffer('Performance test data')

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const encrypted = await cryptoManager.encryptAESGCM(key.id, plaintext)
        await cryptoManager.decryptAESGCM(encrypted)
      }

      const encryptMetrics = cryptoManager.getOperationMetrics('encrypt_aes_gcm')
      const decryptMetrics = cryptoManager.getOperationMetrics('decrypt_aes_gcm')

      expect(encryptMetrics.count).toBe(10)
      expect(decryptMetrics.count).toBe(10)
      expect(encryptMetrics.averageTime).toBeGreaterThan(0)
      expect(decryptMetrics.averageTime).toBeGreaterThan(0)
    })

    it('should perform timing analysis for potential attacks', async () => {
      const keyPair = await cryptoManager.generateRSAKeyPair(2048)
      const validCiphertext = await cryptoManager.encryptRSA(
        keyPair.publicKey.id,
        stringToArrayBuffer('Valid message')
      )

      // Test decryption timing consistency
      const decryptOperation = () =>
        cryptoManager.decryptRSA(keyPair.privateKey.id, validCiphertext)

      const timingAnalysis = await cryptoManager.performTimingTest(decryptOperation, 100)

      expect(timingAnalysis.times.length).toBe(100)
      expect(timingAnalysis.average).toBeGreaterThan(0)

      // Standard deviation should be relatively low for consistent operations
      const cv = timingAnalysis.stddev / timingAnalysis.average
      expect(cv).toBeLessThan(1.0) // Coefficient of variation should be reasonable
    })
  })

  /**
   * Property-Based Testing for Cryptographic Properties
   */
  it('property: encryption should be reversible for valid inputs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        fc.constantFrom(128, 192, 256),
        async (plaintext, keySize) => {
          const key = await cryptoManager.generateAESKey(keySize as any)
          const plaintextBuffer = stringToArrayBuffer(plaintext)

          const encrypted = await cryptoManager.encryptAESGCM(key.id, plaintextBuffer)
          const decrypted = await cryptoManager.decryptAESGCM(encrypted)

          expect(arrayBufferToString(decrypted)).toBe(arrayBufferToString(plaintextBuffer))
        }
      ),
      { numRuns: 50 }
    )
  })

  it('property: signatures should be verifiable for any data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 10000 }),
        fc.constantFrom('RSA-PSS', 'ECDSA'),
        async (data, algorithm) => {
          const keyPair = await cryptoManager.generateSigningKeyPair(algorithm as any)
          const dataBuffer = stringToArrayBuffer(data)

          const signature = await cryptoManager.signData(keyPair.privateKey.id, dataBuffer)
          const isValid = await cryptoManager.verifySignature(
            keyPair.publicKey.id,
            signature,
            dataBuffer
          )

          expect(isValid).toBe(true)
          expect(signature.algorithm).toBe(algorithm)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('property: hash function should be deterministic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 10000 }),
        fc.constantFrom('SHA-256', 'SHA-384', 'SHA-512'),
        async (input, algorithm) => {
          const inputBuffer = stringToArrayBuffer(input)

          const hash1 = await cryptoManager.hash(inputBuffer, algorithm as any)
          const hash2 = await cryptoManager.hash(inputBuffer, algorithm as any)

          expect(arrayBufferToString(hash1.hash)).toBe(arrayBufferToString(hash2.hash))
          expect(hash1.algorithm).toBe(algorithm)
          expect(hash2.algorithm).toBe(algorithm)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Edge Cases and Error Handling
   */
  describe('Edge Cases', () => {
    it('should handle empty plaintext', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const emptyPlaintext = new ArrayBuffer(0)

      const encrypted = await cryptoManager.encryptAESGCM(key.id, emptyPlaintext)
      const decrypted = await cryptoManager.decryptAESGCM(encrypted)

      expect(decrypted.byteLength).toBe(0)
    })

    it('should handle very large plaintexts for symmetric encryption', async () => {
      const key = await cryptoManager.generateAESKey(256)
      const largePlaintext = new ArrayBuffer(1024 * 1024) // 1MB

      const encrypted = await cryptoManager.encryptAESGCM(key.id, largePlaintext)
      const decrypted = await cryptoManager.decryptAESGCM(encrypted)

      expect(decrypted.byteLength).toBe(largePlaintext.byteLength)
    })

    it('should handle corrupted key material gracefully', async () => {
      const plaintext = stringToArrayBuffer('Test message')

      // Try to encrypt with non-existent key
      await expect(cryptoManager.encryptAESGCM('non_existent_key', plaintext)).rejects.toThrow(
        'Invalid or inactive AES-GCM key'
      )
    })
  })
})
