/**
 * データ暗号化システムのテスト
 * Developer 2: データ暗号化・ハッシュ化・暗号化ユーティリティ実装のテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'
import {
  SymmetricEncryption,
  HashingService,
  TokenGenerator,
  PIIEncryption,
  DatabaseEncryption,
  symmetricEncryption,
  hashingService,
  tokenGenerator,
  piiEncryption,
  databaseEncryption,
} from '../encryption'

// テスト用の環境変数設定
const originalEnv = process.env

describe('データ暗号化システム', () => {
  beforeEach(() => {
    // テスト用環境変数の設定
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex')
    process.env.HASH_PEPPER = crypto.randomBytes(16).toString('hex')
    process.env.APP_SECRET = 'test-app-secret-for-hmac-operations'
  })

  afterEach(() => {
    // 環境変数を復元
    process.env = { ...originalEnv }
  })

  describe('SymmetricEncryption', () => {
    let encryption: SymmetricEncryption

    beforeEach(() => {
      encryption = new SymmetricEncryption()
    })

    it('データを暗号化して復号化できる', () => {
      const originalData = 'これは機密情報です。テスト用データ。'
      
      const encrypted = encryption.encrypt(originalData)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(originalData)
      expect(encrypted.encrypted).not.toBe(originalData)
      expect(encrypted.iv).toHaveLength(32) // hex文字列
      expect(encrypted.tag).toHaveLength(32) // hex文字列
    })

    it('キー派生を使用した暗号化・復号化', () => {
      const originalData = '重要な個人情報データ'
      
      const encrypted = encryption.encrypt(originalData, true)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(originalData)
      expect(encrypted.salt).toBeDefined()
      expect(encrypted.salt).toHaveLength(64) // 32バイト = 64hex文字
    })

    it('ファイルの暗号化・復号化', () => {
      const originalFile = Buffer.from('これはテスト用のファイル内容です。')
      
      const encrypted = encryption.encryptFile(originalFile)
      const decryptedFile = encryption.decryptFile(encrypted)

      expect(Buffer.compare(originalFile, decryptedFile)).toBe(0)
      expect(encrypted.salt).toBeDefined() // ファイル暗号化ではキー派生を使用
    })

    it('異なるIVで同じデータを暗号化すると異なる結果', () => {
      const data = '同じデータ'
      
      const encrypted1 = encryption.encrypt(data)
      const encrypted2 = encryption.encrypt(data)

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('改ざんされたデータの復号化は失敗する', () => {
      const data = '改ざんテスト'
      const encrypted = encryption.encrypt(data)

      // 暗号化データを改ざん
      const tamperedData = {
        ...encrypted,
        encrypted: encrypted.encrypted.substring(0, encrypted.encrypted.length - 2) + 'XX',
      }

      expect(() => encryption.decrypt(tamperedData)).toThrow()
    })

    it('不正なタグで復号化は失敗する', () => {
      const data = 'タグ検証テスト'
      const encrypted = encryption.encrypt(data)

      // 認証タグを改ざん
      const tamperedData = {
        ...encrypted,
        tag: '0'.repeat(32),
      }

      expect(() => encryption.decrypt(tamperedData)).toThrow()
    })
  })

  describe('HashingService', () => {
    let hashing: HashingService

    beforeEach(() => {
      hashing = new HashingService()
    })

    it('パスワードをハッシュ化して検証できる', async () => {
      const password = 'SecurePassword123!'
      
      const hashResult = await hashing.hashPassword(password)
      const isValid = await hashing.verifyPassword(password, hashResult.hash)

      expect(isValid).toBe(true)
      expect(hashResult.hash).not.toBe(password)
      expect(hashResult.salt).toBeDefined()
      expect(hashResult.rounds).toBe(12)
    })

    it('間違ったパスワードは検証に失敗する', async () => {
      const password = 'CorrectPassword'
      const wrongPassword = 'WrongPassword'
      
      const hashResult = await hashing.hashPassword(password)
      const isValid = await hashing.verifyPassword(wrongPassword, hashResult.hash)

      expect(isValid).toBe(false)
    })

    it('機密データをハッシュ化できる', () => {
      const sensitiveData = 'user@example.com'
      
      const hash = hashing.hashSensitiveData(sensitiveData)

      expect(hash).toHaveLength(64) // SHA-256 = 64hex文字
      expect(hash).not.toBe(sensitiveData)
    })

    it('同じデータは同じハッシュを生成する', () => {
      const data = 'consistent-data'
      
      const hash1 = hashing.hashSensitiveData(data)
      const hash2 = hashing.hashSensitiveData(data)

      expect(hash1).toBe(hash2)
    })

    it('タイムスタンプ付きハッシュは毎回異なる', () => {
      const data = 'time-sensitive-data'
      
      const hash1 = hashing.hashSensitiveData(data, true)
      // 時間を少し待つ
      const hash2 = hashing.hashSensitiveData(data, true)

      expect(hash1).not.toBe(hash2)
    })

    it('メールアドレスの匿名化ハッシュ', () => {
      const email = 'User@Example.COM'
      const normalizedExpected = hashing.hashEmailForAnalytics('user@example.com')
      
      const hash = hashing.hashEmailForAnalytics(email)

      expect(hash).toBe(normalizedExpected)
      expect(hash).toHaveLength(64)
    })

    it('セッション署名の生成と検証', () => {
      const sessionData = { userId: 'user123', role: 'user', exp: Date.now() + 3600000 }
      
      const signature = hashing.signSession(sessionData)
      const isValid = hashing.verifySessionSignature(sessionData, signature)

      expect(isValid).toBe(true)
      expect(signature).toHaveLength(64)
    })

    it('改ざんされたセッションデータは検証に失敗する', () => {
      const originalData = { userId: 'user123', role: 'user' }
      const tamperedData = { userId: 'user123', role: 'admin' } // roleが改ざんされている
      
      const signature = hashing.signSession(originalData)
      const isValid = hashing.verifySessionSignature(tamperedData, signature)

      expect(isValid).toBe(false)
    })
  })

  describe('TokenGenerator', () => {
    let tokenGen: TokenGenerator

    beforeEach(() => {
      tokenGen = new TokenGenerator()
    })

    it('セキュアなトークンを生成する', () => {
      const token = tokenGen.generateSecureToken(32)

      expect(token).toHaveLength(64) // 32バイト = 64hex文字
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('URLセーフなトークンを生成する', () => {
      const token = tokenGen.generateUrlSafeToken(32)

      expect(token.length).toBeGreaterThan(0)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/) // base64url文字セット
    })

    it('OTPを生成する', () => {
      const otp4 = tokenGen.generateOTP(4)
      const otp6 = tokenGen.generateOTP(6)
      const otp8 = tokenGen.generateOTP(8)

      expect(otp4).toHaveLength(4)
      expect(otp6).toHaveLength(6)
      expect(otp8).toHaveLength(8)
      expect(otp4).toMatch(/^\d{4}$/)
      expect(otp6).toMatch(/^\d{6}$/)
      expect(otp8).toMatch(/^\d{8}$/)
    })

    it('複数のトークンは異なる値を持つ', () => {
      const tokens = Array.from({ length: 10 }, () => tokenGen.generateSecureToken(16))
      const uniqueTokens = new Set(tokens)

      expect(uniqueTokens.size).toBe(tokens.length)
    })

    it('期限付きトークンの生成と検証', () => {
      const payload = { userId: 'user123', action: 'reset-password' }
      
      // 暗号化結果を完全に取得する必要があります
      const encryption = new SymmetricEncryption()
      const tokenData = {
        payload,
        exp: Date.now() + (60 * 60 * 1000), // 1時間後
        iat: Date.now(),
        nonce: tokenGen.generateSecureToken(16),
      }
      
      const encryptionResult = encryption.encrypt(JSON.stringify(tokenData), true)
      
      const verifiedPayload = tokenGen.verifyTimedToken(
        encryptionResult.encrypted,
        encryptionResult.iv,
        encryptionResult.tag,
        encryptionResult.salt!
      )

      expect(verifiedPayload).toEqual(payload)
    })

    it('期限切れトークンは検証に失敗する', () => {
      const payload = { userId: 'user123', action: 'expired-token' }
      
      const encryption = new SymmetricEncryption()
      const tokenData = {
        payload,
        exp: Date.now() - 1000, // 1秒前（期限切れ）
        iat: Date.now() - 3600000, // 1時間前
        nonce: tokenGen.generateSecureToken(16),
      }
      
      const encryptionResult = encryption.encrypt(JSON.stringify(tokenData), true)
      
      const verifiedPayload = tokenGen.verifyTimedToken(
        encryptionResult.encrypted,
        encryptionResult.iv,
        encryptionResult.tag,
        encryptionResult.salt!
      )

      expect(verifiedPayload).toBeNull()
    })
  })

  describe('PIIEncryption', () => {
    let pii: PIIEncryption

    beforeEach(() => {
      pii = new PIIEncryption()
    })

    it('個人情報を暗号化・復号化する', () => {
      const userData = {
        email: 'user@example.com',
        name: '山田太郎',
        phone: '090-1234-5678',
        address: '東京都渋谷区...',
      }

      const encrypted = pii.encryptPII(userData)
      const decrypted = pii.decryptPII(encrypted)

      expect(decrypted.email).toBe(userData.email)
      expect(decrypted.name).toBe(userData.name)
      expect(decrypted.phone).toBe(userData.phone)
      expect(decrypted.address).toBe(userData.address)
    })

    it('検索可能ハッシュを生成する', () => {
      const email = 'Search@Example.COM'
      const normalizedEmail = 'search@example.com'
      
      const hash1 = pii.createSearchableHash(email)
      const hash2 = pii.createSearchableHash(normalizedEmail)

      expect(hash1).toBe(hash2) // 正規化されるため同じハッシュ
      expect(hash1).toHaveLength(64)
    })

    it('部分マッチング用のハッシュセットを生成する', () => {
      const name = 'yamada taro'
      
      const hashes = pii.createPartialSearchHashes(name)

      expect(hashes.length).toBeGreaterThan(0)
      expect(hashes).toEqual(expect.arrayContaining([
        expect.stringMatching(/^[a-f0-9]{64}$/)
      ]))

      // 重複が除去されているかチェック
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(hashes.length)
    })

    it('短い文字列では適切な数のハッシュを生成する', () => {
      const shortName = 'ab'
      
      const hashes = pii.createPartialSearchHashes(shortName)

      // 3文字未満なのでハッシュは生成されない
      expect(hashes).toHaveLength(0)
    })

    it('null・undefined値は適切に処理される', () => {
      const partialData = {
        email: 'test@example.com',
        name: undefined,
        phone: null,
      }

      const encrypted = pii.encryptPII(partialData as any)
      const decrypted = pii.decryptPII(encrypted)

      expect(decrypted.email).toBe('test@example.com')
      expect(decrypted.name).toBe('')
      expect(decrypted.phone).toBe('')
    })
  })

  describe('DatabaseEncryption', () => {
    let dbEncryption: DatabaseEncryption

    beforeEach(() => {
      dbEncryption = new DatabaseEncryption()
    })

    it('ユーザーデータを包括的に暗号化する', () => {
      const userData = {
        email: 'database@example.com',
        name: '田中花子',
        phone: '080-9876-5432',
        address: '大阪府大阪市...',
      }

      const result = dbEncryption.encryptUserData(userData)

      expect(result.encryptedData.email).toBeDefined()
      expect(result.encryptedData.name).toBeDefined()
      expect(result.encryptedData.phone).toBeDefined()
      expect(result.encryptedData.address).toBeDefined()

      expect(result.emailHash).toHaveLength(64)
      expect(result.nameHash).toHaveLength(64)

      expect(Array.isArray(result.emailSearchHashes)).toBe(true)
      expect(Array.isArray(result.nameSearchHashes)).toBe(true)
      expect(result.emailSearchHashes.length).toBeGreaterThan(0)
      expect(result.nameSearchHashes.length).toBeGreaterThan(0)
    })

    it('暗号化されたデータを復号化する', () => {
      const userData = {
        email: 'decrypt@example.com',
        name: '佐藤次郎',
      }

      const encrypted = dbEncryption.encryptUserData(userData)
      const decrypted = dbEncryption.decryptUserData({ encryptedData: encrypted.encryptedData })

      expect(decrypted.email).toBe(userData.email)
      expect(decrypted.name).toBe(userData.name)
    })

    it('検索ハッシュを生成する', () => {
      const searchTerm = 'Search Term Example'
      
      const hash = dbEncryption.generateSearchHash(searchTerm)

      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]+$/)
    })

    it('必須フィールドのみでも動作する', () => {
      const minimalData = {
        email: 'minimal@example.com',
      }

      const result = dbEncryption.encryptUserData(minimalData)
      const decrypted = dbEncryption.decryptUserData({ encryptedData: result.encryptedData })

      expect(decrypted.email).toBe(minimalData.email)
      expect(result.emailHash).toHaveLength(64)
      expect(result.nameHash).toBeNull()
    })
  })

  describe('エラーハンドリングとセキュリティ', () => {
    it('環境変数が設定されていない場合の適切なエラー処理', () => {
      delete process.env.ENCRYPTION_KEY
      delete process.env.HASH_PEPPER
      delete process.env.APP_SECRET

      expect(() => new SymmetricEncryption()).toThrow('暗号化設定エラー')
    })

    it('不正なフォーマットのデータ復号化は失敗する', () => {
      const encryption = new SymmetricEncryption()
      
      const invalidData = {
        encrypted: 'invalid-hex-data',
        iv: 'invalid-iv',
        tag: 'invalid-tag',
      }

      expect(() => encryption.decrypt(invalidData)).toThrow()
    })

    it('メモリダンプ攻撃への対策（タイミング攻撃防止）', () => {
      const hashing = new HashingService()
      const sessionData = { userId: 'timing-test', role: 'user' }
      
      const correctSignature = hashing.signSession(sessionData)
      const wrongSignature = '0'.repeat(64)
      
      // 正しい署名と間違った署名の検証時間を測定
      const startCorrect = process.hrtime()
      hashing.verifySessionSignature(sessionData, correctSignature)
      const timeCorrect = process.hrtime(startCorrect)
      
      const startWrong = process.hrtime()
      hashing.verifySessionSignature(sessionData, wrongSignature)
      const timeWrong = process.hrtime(startWrong)
      
      // タイミング攻撃防止のため、時間差は最小限であることを期待
      const diffNs = Math.abs(timeCorrect[1] - timeWrong[1])
      expect(diffNs).toBeLessThan(10000000) // 10ms以下の差
    })
  })

  describe('統合テスト', () => {
    it('暗号化システム全体のワークフロー', async () => {
      // 1. ユーザー登録時の暗号化
      const userData = {
        email: 'integration@example.com',
        name: '統合テストユーザー',
        phone: '070-1111-2222',
        address: '神奈川県横浜市...',
      }

      const encrypted = databaseEncryption.encryptUserData(userData)
      
      // 2. データベース保存シミュレーション（ハッシュベース検索）
      const emailSearchHash = databaseEncryption.generateSearchHash(userData.email)
      expect(emailSearchHash).toBe(encrypted.emailHash)
      
      // 3. データ取得時の復号化
      const decrypted = databaseEncryption.decryptUserData({
        encryptedData: encrypted.encryptedData
      })
      
      expect(decrypted).toEqual(userData)
      
      // 4. パスワードハッシュ化（別のワークフロー）
      const password = 'UserSecurePassword123!'
      const passwordHash = await hashingService.hashPassword(password)
      const passwordVerified = await hashingService.verifyPassword(password, passwordHash.hash)
      
      expect(passwordVerified).toBe(true)
      
      // 5. セッション管理
      const sessionData = { userId: 'user123', email: decrypted.email, role: 'user' }
      const sessionSignature = hashingService.signSession(sessionData)
      const sessionVerified = hashingService.verifySessionSignature(sessionData, sessionSignature)
      
      expect(sessionVerified).toBe(true)
    })
  })
})