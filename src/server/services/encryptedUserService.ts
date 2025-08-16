/**
 * 暗号化対応ユーザーサービス
 * Developer 2: データ暗号化・ハッシュ化・暗号化ユーティリティ実装
 */

import { prisma } from '@/lib/db'
import { logger } from '../../services/logger'
import {
  databaseEncryption,
  hashingService,
  piiEncryption,
  type DecryptionInput,
  type EncryptionResult,
} from '@/lib/security/encryption'
import { z } from 'zod'

// 暗号化ユーザーデータスキーマ
const EncryptedUserDataSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const _DecryptionInputSchema = z.object({
  // TODO: Will be used in future
  encrypted: z.string(),
  iv: z.string(),
  tag: z.string(),
  salt: z.string().optional(),
})

export type EncryptedUserInput = z.infer<typeof EncryptedUserDataSchema>
export type EncryptedUserData = Record<string, EncryptionResult>

/**
 * 暗号化対応ユーザーサービス
 */
export class EncryptedUserService {
  /**
   * ユーザーデータの暗号化保存
   */
  async createEncryptedUser(userId: string, userData: EncryptedUserInput): Promise<void> {
    try {
      // 入力データ検証
      const validatedData = EncryptedUserDataSchema.parse(userData)

      // データ暗号化
      const encryptedResult = databaseEncryption.encryptUserData(validatedData)

      // データベースに保存
      await prisma.$transaction(async (tx) => {
        // 暗号化データの保存
        await tx.$executeRaw`
          INSERT INTO "EncryptedUserData" (
            "userId", "encryptedEmail", "encryptedName", "encryptedPhone", "encryptedAddress",
            "emailHash", "nameHash", "phoneHash", "addressHash",
            "emailSearchHashes", "nameSearchHashes", "phoneSearchHashes", "addressSearchHashes",
            "encryptionMetadata"
          ) VALUES (
            ${userId},
            ${JSON.stringify(encryptedResult.encryptedData.email)},
            ${encryptedResult.encryptedData.name ? JSON.stringify(encryptedResult.encryptedData.name) : null},
            ${encryptedResult.encryptedData.phone ? JSON.stringify(encryptedResult.encryptedData.phone) : null},
            ${encryptedResult.encryptedData.address ? JSON.stringify(encryptedResult.encryptedData.address) : null},
            ${encryptedResult.emailHash},
            ${encryptedResult.nameHash},
            ${encryptedResult.encryptedData.phone ? hashingService.hashSensitiveData(validatedData?.phone) : null},
            ${encryptedResult.encryptedData.address ? hashingService.hashSensitiveData(validatedData?.address) : null},
            ${encryptedResult.emailSearchHashes},
            ${encryptedResult.nameSearchHashes},
            ${validatedData.phone ? piiEncryption.createPartialSearchHashes(validatedData.phone) : []},
            ${validatedData.address ? piiEncryption.createPartialSearchHashes(validatedData.address) : []}::text[],
            ${JSON.stringify({
              algorithm: 'aes-256-gcm',
              keyDerivation: true,
              createdAt: new Date().toISOString(),
            })}
          )
        `

        // ハッシュテーブルに追加
        await tx.$executeRaw`
          INSERT INTO "SensitiveDataHashes" ("entityType", "entityId", "hashType", "hashValue")
          VALUES 
            ('user', ${userId}, 'email', ${encryptedResult.emailHash})
        `

        if (encryptedResult.nameHash) {
          await tx.$executeRaw`
            INSERT INTO "SensitiveDataHashes" ("entityType", "entityId", "hashType", "hashValue")
            VALUES ('user', ${userId}, 'name', ${encryptedResult.nameHash})
          `
        }
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`暗号化ユーザーデータが保存されました: ${userId}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('暗号化ユーザー作成エラー:', error)
      }
      throw new Error('暗号化ユーザーデータの保存に失敗しました')
    }
  }

  /**
   * 暗号化ユーザーデータの取得・復号
   */
  async getDecryptedUserData(userId: string): Promise<EncryptedUserInput | null> {
    try {
      const result = await prisma.$queryRaw<
        Array<{
          encryptedEmail: string
          encryptedName: string | null
          encryptedPhone: string | null
          encryptedAddress: string | null
        }>
      >`
        SELECT "encryptedEmail", "encryptedName", "encryptedPhone", "encryptedAddress"
        FROM "EncryptedUserData"
        WHERE "userId" = ${userId}
      `

      if (!result || result.length === 0) {
        return null
      }

      const encryptedData = result[0]

      // 復号化
      const decrypted: Record<string, DecryptionInput> = {}

      if (encryptedData.encryptedEmail) {
        decrypted.email = JSON.parse(encryptedData.encryptedEmail)
      }
      if (encryptedData.encryptedName) {
        decrypted.name = JSON.parse(encryptedData.encryptedName)
      }
      if (encryptedData.encryptedPhone) {
        decrypted.phone = JSON.parse(encryptedData.encryptedPhone)
      }
      if (encryptedData.encryptedAddress) {
        decrypted.address = JSON.parse(encryptedData.encryptedAddress)
      }

      const decryptedUserData = databaseEncryption.decryptUserData({
        encryptedData: decrypted,
      })

      return {
        email: decryptedUserData.email,
        name: decryptedUserData.name || undefined,
        phone: decryptedUserData.phone || undefined,
        address: decryptedUserData.address || undefined,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('暗号化ユーザーデータ取得エラー:', error)
      }
      throw new Error('ユーザーデータの復号に失敗しました')
    }
  }

  /**
   * 暗号化ユーザーデータの更新
   */
  async updateEncryptedUserData(
    userId: string,
    updateData: Partial<EncryptedUserInput>
  ): Promise<void> {
    try {
      if (Object.keys(updateData).length === 0) {
        return
      }

      // 既存データの取得
      const existingData = await this.getDecryptedUserData(userId)
      if (!existingData) {
        throw new Error('ユーザーデータが存在しません')
      }

      // データのマージ
      const mergedData = {
        ...existingData,
        ...updateData,
      }

      // 再暗号化
      const encryptedResult = databaseEncryption.encryptUserData(mergedData)

      // データベース更新
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE "EncryptedUserData" SET
            "encryptedEmail" = ${JSON.stringify(encryptedResult.encryptedData.email)},
            "encryptedName" = ${encryptedResult.encryptedData.name ? JSON.stringify(encryptedResult.encryptedData.name) : null},
            "encryptedPhone" = ${encryptedResult.encryptedData.phone ? JSON.stringify(encryptedResult.encryptedData.phone) : null},
            "encryptedAddress" = ${encryptedResult.encryptedData.address ? JSON.stringify(encryptedResult.encryptedData.address) : null},
            "emailHash" = ${encryptedResult.emailHash},
            "nameHash" = ${encryptedResult.nameHash},
            "phoneHash" = ${mergedData.phone ? hashingService.hashSensitiveData(mergedData.phone) : null},
            "addressHash" = ${mergedData.address ? hashingService.hashSensitiveData(mergedData.address) : null},
            "emailSearchHashes" = ${encryptedResult.emailSearchHashes},
            "nameSearchHashes" = ${encryptedResult.nameSearchHashes},
            "phoneSearchHashes" = ${mergedData.phone ? piiEncryption.createPartialSearchHashes(mergedData.phone) : []},
            "addressSearchHashes" = ${mergedData.address ? piiEncryption.createPartialSearchHashes(mergedData.address) : []}::text[],
            "updatedAt" = NOW()
          WHERE "userId" = ${userId}
        `

        // ハッシュテーブルの更新
        await tx.$executeRaw`
          DELETE FROM "SensitiveDataHashes" 
          WHERE "entityType" = 'user' AND "entityId" = ${userId}
        `

        await tx.$executeRaw`
          INSERT INTO "SensitiveDataHashes" ("entityType", "entityId", "hashType", "hashValue")
          VALUES ('user', ${userId}, 'email', ${encryptedResult.emailHash})
        `

        if (encryptedResult.nameHash) {
          await tx.$executeRaw`
            INSERT INTO "SensitiveDataHashes" ("entityType", "entityId", "hashType", "hashValue")
            VALUES ('user', ${userId}, 'name', ${encryptedResult.nameHash})
          `
        }
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`暗号化ユーザーデータが更新されました: ${userId}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('暗号化ユーザーデータ更新エラー:', error)
      }
      throw new Error('ユーザーデータの更新に失敗しました')
    }
  }

  /**
   * メールアドレスでユーザー検索（ハッシュベース）
   */
  async findUserByEmailHash(email: string): Promise<string | null> {
    try {
      const emailHash = databaseEncryption.generateSearchHash(email)

      const result = await prisma.$queryRaw<Array<{ userId: string }>>`
        SELECT "userId"
        FROM "EncryptedUserData"
        WHERE "emailHash" = ${emailHash}
        LIMIT 1
      `

      return result.length > 0 ? result[0].userId : null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('メールハッシュ検索エラー:', error)
      }
      return null
    }
  }

  /**
   * 部分マッチング検索（名前や住所など）
   */
  async searchUsersByPartialMatch(
    searchTerm: string,
    field: 'name' | 'phone' | 'address'
  ): Promise<string[]> {
    try {
      const searchHashes = piiEncryption.createPartialSearchHashes(searchTerm)
      const searchHashesStr = searchHashes.map((h) => `'${h}'`).join(',')

      const fieldColumn = `${field}SearchHashes`

      const result = await prisma.$queryRaw<Array<{ userId: string }>>`
        SELECT DISTINCT "userId"
        FROM "EncryptedUserData"
        WHERE ${prisma.sql([fieldColumn])} && ARRAY[${prisma.sql([searchHashesStr])}]::text[]
        LIMIT 100
      `

      return result.map((r) => r.userId)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('部分マッチング検索エラー:', error)
      }
      return []
    }
  }

  /**
   * 暗号化ユーザーデータの削除
   */
  async deleteEncryptedUserData(userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          DELETE FROM "EncryptedUserData" WHERE "userId" = ${userId}
        `

        await tx.$executeRaw`
          DELETE FROM "SensitiveDataHashes" 
          WHERE "entityType" = 'user' AND "entityId" = ${userId}
        `
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`暗号化ユーザーデータが削除されました: ${userId}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('暗号化ユーザーデータ削除エラー:', error)
      }
      throw new Error('ユーザーデータの削除に失敗しました')
    }
  }

  /**
   * データ整合性チェック
   */
  async checkDataIntegrity(): Promise<
    Array<{
      userId: string
      hasUserRecord: boolean
      hasEncryptedData: boolean
      emailHashValid: boolean
      issueDescription: string
    }>
  > {
    try {
      const result = await prisma.$queryRaw<
        Array<{
          user_id: string
          has_user_record: boolean
          has_encrypted_data: boolean
          email_hash_valid: boolean
          issue_description: string
        }>
      >`
        SELECT * FROM check_encryption_integrity()
      `

      return result.map((row) => ({
        userId: row.user_id,
        hasUserRecord: row.has_user_record,
        hasEncryptedData: row.has_encrypted_data,
        emailHashValid: row.email_hash_valid,
        issueDescription: row.issue_description,
      }))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('データ整合性チェックエラー:', error)
      }
      throw new Error('データ整合性チェックに失敗しました')
    }
  }

  /**
   * 既存プレーンテキストデータの暗号化マイグレーション
   */
  async migrateExistingUserData(): Promise<{ migrated: number; errors: number }> {
    let migrated = 0
    let errors = 0

    try {
      // プレーンテキストのユーザーデータを取得（暗号化データが無いもの）
      const users = await prisma.$queryRaw<
        Array<{
          id: string
          email: string
          name: string | null
        }>
      >`
        SELECT u."id", u."email", u."name"
        FROM "User" u
        LEFT JOIN "EncryptedUserData" eud ON u."id" = eud."userId"
        WHERE eud."userId" IS NULL
          AND u."email" IS NOT NULL
      `

      for (const user of users) {
        try {
          await this.createEncryptedUser(user.id, {
            email: user.email,
            name: user.name || undefined,
          })
          migrated++
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error(`ユーザー ${user.id} の移行に失敗:`, error)
          }
          errors++
        }
      }

      return { migrated, errors }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('データ移行エラー:', error)
      }
      throw new Error('データ移行に失敗しました')
    }
  }
}

// サービスインスタンスのエクスポート
export const _encryptedUserService = new EncryptedUserService()

export default EncryptedUserService
