/**
 * バックエンドサービス実装
 * Developer 2: サーバーサイド・API基盤
 * 技術スタック: tRPC, Prisma
 * セキュリティレベル: High
 * 最終更新: {updated}
 */

import nodemailer from 'nodemailer'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'

// メール設定
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: {
    name: process.env.SMTP_FROM_NAME || 'PMP Learning Management',
    address: process.env.SMTP_FROM_EMAIL || 'noreply@pmplm.com',
  },
}

// メール送信データスキーマ
export const emailDataSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1),
  template: z.string().optional(),
  data: z.record(z.any()).optional().default({}),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.union([z.string(), z.instanceof(Buffer)]),
        contentType: z.string().optional(),
      })
    )
    .optional(),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  trackingEnabled: z.boolean().optional().default(true),
})

export type EmailData = z.infer<typeof emailDataSchema>

// SMTPトランスポーター作成
const createTransporter = () => {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    throw new Error('SMTP認証情報が設定されていません')
  }

  return nodemailer.createTransporter({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    pool: true, // プール接続使用
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1秒間隔
    rateLimit: 10, // 1秒間に最大10通
  })
}

// メールテンプレートの型定義
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// メールテンプレートキャッシュ
const templateCache = new Map<string, EmailTemplate>()

// テンプレートローダー
class EmailTemplateLoader {
  private static templateDir = path.join(process.cwd(), 'src/server/templates/email')

  // テンプレート読み込み
  static async loadTemplate(templateName: string): Promise<EmailTemplate> {
    // キャッシュから取得
    if (templateCache.has(templateName)) {
      return templateCache.get(templateName)!
    }

    try {
      const templatePath = path.join(this.templateDir, templateName)

      // HTMLテンプレート読み込み
      const htmlPath = path.join(templatePath, 'template.html')
      const htmlContent = await fs.readFile(htmlPath, 'utf-8')

      // テキストテンプレート読み込み（任意）
      let textContent: string | undefined
      try {
        const textPath = path.join(templatePath, 'template.txt')
        textContent = await fs.readFile(textPath, 'utf-8')
      } catch {
        // テキストテンプレートがない場合は無視
      }

      // メタデータ読み込み
      const metaPath = path.join(templatePath, 'meta.json')
      let subject = '通知'
      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8')
        const meta = JSON.parse(metaContent)
        subject = meta.subject || subject
      } catch {
        // メタデータがない場合はデフォルト値を使用
      }

      const template: EmailTemplate = {
        subject,
        html: htmlContent,
        text: textContent,
      }

      // キャッシュに保存
      templateCache.set(templateName, template)

      return template
    } catch (error) {
      console.error(`メールテンプレート読み込みエラー (${templateName}):`, error)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `メールテンプレートが見つかりません: ${templateName}`,
      })
    }
  }

  // デフォルトテンプレート生成
  static getDefaultTemplate(): EmailTemplate {
    return {
      subject: '{{title}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>{{title}}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
            .title { font-size: 20px; color: #374151; margin: 20px 0; }
            .content { line-height: 1.6; color: #4b5563; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PMP Learning Management</div>
            </div>
            
            {{#if title}}
            <h1 class="title">{{title}}</h1>
            {{/if}}
            
            <div class="content">
              {{#if message}}
              <p>{{message}}</p>
              {{/if}}
              
              {{#if actionUrl}}
              <p>
                <a href="{{actionUrl}}" class="button">{{actionText}}</a>
              </p>
              {{/if}}
              
              {{#if additionalInfo}}
              <div style="margin: 20px 0;">
                {{additionalInfo}}
              </div>
              {{/if}}
            </div>
            
            <div class="footer">
              <p>このメールは PMP Learning Management から自動送信されています。</p>
              <p>配信停止をご希望の場合は、アカウント設定より変更してください。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
{{title}}

{{#if name}}
{{name}}さん、
{{/if}}

{{message}}

{{#if actionUrl}}
こちらからアクセス: {{actionUrl}}
{{/if}}

---
PMP Learning Management
このメールは自動送信されています。
      `,
    }
  }
}

// メールサービスクラス
export class EmailService {
  private static transporter = createTransporter()

  // メイン送信機能
  static async sendEmail(emailData: EmailData): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // 入力検証
      const validatedData = emailDataSchema.parse(emailData)

      let htmlContent = validatedData.html
      let textContent = validatedData.text
      let subject = validatedData.subject

      // テンプレートを使用する場合
      if (validatedData.template) {
        const template = await this.renderTemplate(validatedData.template, validatedData.data)

        htmlContent = template.html
        textContent = template.text
        subject = template.subject || validatedData.subject
      }

      // メール送信
      const result = await this.transporter.sendMail({
        from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.address}>`,
        to: validatedData.to,
        cc: validatedData.cc,
        bcc: validatedData.bcc,
        subject,
        html: htmlContent,
        text: textContent,
        attachments: validatedData.attachments,
        priority: validatedData.priority,
        headers: {
          'X-PM-LM-Tracking': validatedData.trackingEnabled ? '1' : '0',
        },
      })

      console.log(`メール送信成功: ${result.messageId}`)

      return {
        success: true,
        messageId: result.messageId,
      }
    } catch (error) {
      console.error('メール送信エラー:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // テンプレートレンダリング
  private static async renderTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<EmailTemplate> {
    try {
      let template: EmailTemplate

      // 特定のテンプレートを読み込み
      try {
        template = await EmailTemplateLoader.loadTemplate(templateName)
      } catch {
        // テンプレートが見つからない場合はデフォルトを使用
        console.warn(
          `テンプレート ${templateName} が見つかりません。デフォルトテンプレートを使用します。`
        )
        template = EmailTemplateLoader.getDefaultTemplate()
      }

      // Handlebarsでレンダリング
      const subjectTemplate = Handlebars.compile(template.subject)
      const htmlTemplate = Handlebars.compile(template.html)
      const textTemplate = template.text ? Handlebars.compile(template.text) : null

      return {
        subject: subjectTemplate(data),
        html: htmlTemplate(data),
        text: textTemplate ? textTemplate(data) : undefined,
      }
    } catch (error) {
      console.error('テンプレートレンダリングエラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'メールテンプレートの処理中にエラーが発生しました',
      })
    }
  }

  // バルクメール送信
  static async sendBulkEmail(
    recipients: string[],
    emailData: Omit<EmailData, 'to'>
  ): Promise<{
    totalRecipients: number
    successCount: number
    failureCount: number
    errors: Array<{ email: string; error: string }>
  }> {
    const totalRecipients = recipients.length
    let successCount = 0
    let failureCount = 0
    const errors: Array<{ email: string; error: string }> = []

    // バッチサイズを制限（SMTP制限を考慮）
    const batchSize = 10
    const batches = []

    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const promises = batch.map(async (email) => {
        try {
          const result = await this.sendEmail({
            ...emailData,
            to: email,
          })

          if (result.success) {
            successCount++
          } else {
            failureCount++
            errors.push({ email, error: result.error || 'Unknown error' })
          }
        } catch (error) {
          failureCount++
          errors.push({
            email,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })

      // バッチ内並行処理
      await Promise.allSettled(promises)

      // レート制限を考慮した間隔
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return {
      totalRecipients,
      successCount,
      failureCount,
      errors,
    }
  }

  // メール配信可能性チェック
  static async verifyConnection(): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await this.transporter.verify()
      return { success: true }
    } catch (error) {
      console.error('SMTP接続確認エラー:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  // メールアドレス検証
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 配信停止処理
  static async unsubscribe(email: string, type: string): Promise<void> {
    // 実装に応じて配信停止リストに追加
    // 例: データベースに記録、外部サービスAPI呼び出しなど
    console.log(`配信停止登録: ${email} (type: ${type})`)
  }

  // メール送信統計取得
  static async getEmailStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSent: number
    successRate: number
    bounceRate: number
    unsubscribeRate: number
  }> {
    // 実装に応じてメール送信履歴から統計を計算
    // 現在はモック実装
    return {
      totalSent: 0,
      successRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
    }
  }
}

// 便利関数：共通メールテンプレート
export const sendWelcomeEmail = async (
  userEmail: string,
  userData: { name: string; verificationLink?: string }
): Promise<{ success: boolean; error?: string }> => {
  return EmailService.sendEmail({
    to: userEmail,
    subject: 'PMP Learning Management へようこそ！',
    template: 'welcome',
    data: {
      name: userData.name,
      actionUrl: userData.verificationLink,
      actionText: 'メールアドレスを確認',
      message: 'PMP Learning Management にご登録いただき、ありがとうございます。',
      additionalInfo: userData.verificationLink
        ? 'アカウントを有効化するため、上記ボタンをクリックしてメールアドレスを確認してください。'
        : '今すぐ学習を開始できます！',
    },
  })
}

export const sendPasswordResetEmail = async (
  userEmail: string,
  userData: { name: string; resetLink: string; expiresAt: Date }
): Promise<{ success: boolean; error?: string }> => {
  return EmailService.sendEmail({
    to: userEmail,
    subject: 'パスワードリセットのご案内',
    template: 'password-reset',
    data: {
      name: userData.name,
      actionUrl: userData.resetLink,
      actionText: 'パスワードをリセット',
      message: 'パスワードのリセットが要求されました。',
      additionalInfo: `このリンクは ${userData.expiresAt.toLocaleString('ja-JP')} まで有効です。`,
    },
  })
}

export const sendLearningReminderEmail = async (
  userEmail: string,
  userData: { name: string; streakCount: number; nextGoal?: string }
): Promise<{ success: boolean; error?: string }> => {
  return EmailService.sendEmail({
    to: userEmail,
    subject: '学習リマインダー - 継続は力なり！',
    template: 'learning-reminder',
    data: {
      name: userData.name,
      message: `現在の学習ストリーク: ${userData.streakCount}日`,
      actionUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      actionText: '学習を続ける',
      additionalInfo: userData.nextGoal
        ? `次の目標: ${userData.nextGoal}`
        : '今日も頑張りましょう！',
    },
  })
}

export const sendAchievementEmail = async (
  userEmail: string,
  userData: { name: string; achievement: string; description: string }
): Promise<{ success: boolean; error?: string }> => {
  return EmailService.sendEmail({
    to: userEmail,
    subject: '🎉 新しい実績を獲得しました！',
    template: 'achievement-earned',
    data: {
      name: userData.name,
      title: userData.achievement,
      message: userData.description,
      actionUrl: `${process.env.NEXTAUTH_URL}/progress`,
      actionText: '進捗を確認',
      additionalInfo: '素晴らしい成果です！この調子で学習を続けましょう。',
    },
  })
}

// デフォルトエクスポート
export const sendEmail = EmailService.sendEmail.bind(EmailService)
export default EmailService
