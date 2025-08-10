/**
 * Stripe WebHook Handler
 * Process Stripe events and sync subscription/payment status
 * 担当: 統合・外部APIエンジニア
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { StripeService } from '@/server/services/stripeService'
import { SubscriptionPlan } from '@prisma/client'

// Stripe WebHookイベント型定義
type StripeWebHookEvent =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.trial_will_end'
  | 'payment_method.attached'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'setup_intent.succeeded'

// WebHookイベントハンドラーマップ
const eventHandlers: Record<StripeWebHookEvent, (event: Stripe.Event) => Promise<void>> = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,
  'customer.subscription.trial_will_end': handleTrialWillEnd,
  'payment_method.attached': handlePaymentMethodAttached,
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentIntentFailed,
  'setup_intent.succeeded': handleSetupIntentSucceeded,
}

// メインWebHookハンドラー
export async function handleStripeWebHook(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Stripe署名ヘッダーが見つかりません')
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // WebHook署名検証
    const event = StripeService.verifyWebhookSignature(body, signature)

    console.log(`Stripe WebHookイベント受信: ${event.type} (${event.id})`)

    // イベントタイプに応じた処理
    const handler = eventHandlers[event.type as StripeWebHookEvent]

    if (handler) {
      await handler(event)
      console.log(`WebHookイベント処理完了: ${event.type}`)
    } else {
      console.log(`未処理のWebHookイベント: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Stripe WebHook処理エラー:', error)

    return NextResponse.json({ error: 'WebHook processing failed' }, { status: 400 })
  }
}

// サブスクリプション作成イベント
async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('サブスクリプションにユーザーIDが見つかりません:', subscription.id)
    return
  }

  try {
    // データベースに保存
    await StripeService.syncSubscriptionToDatabase(subscription, userId)

    // ウェルカムメール送信（実装に応じて）
    // await sendWelcomeEmail(userId, subscription)

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_CREATED',
        details: {
          subscriptionId: subscription.id,
          planId: subscription.metadata.planId,
          status: subscription.status,
        },
      },
    })

    console.log(`サブスクリプション作成完了: ${subscription.id} (User: ${userId})`)
  } catch (error) {
    console.error('サブスクリプション作成処理エラー:', error)
    throw error
  }
}

// サブスクリプション更新イベント
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('サブスクリプションにユーザーIDが見つかりません:', subscription.id)
    return
  }

  try {
    // データベースに同期
    await StripeService.syncSubscriptionToDatabase(subscription, userId)

    // 前のイベントと比較してステータス変更を検出
    const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>

    if (previousAttributes?.status && previousAttributes.status !== subscription.status) {
      // ステータス変更の場合
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_STATUS_CHANGED',
          details: {
            subscriptionId: subscription.id,
            oldStatus: previousAttributes.status,
            newStatus: subscription.status,
          },
        },
      })

      console.log(
        `サブスクリプションステータス変更: ${subscription.id} (${previousAttributes.status} → ${subscription.status})`
      )
    }

    // プラン変更の場合
    if (previousAttributes?.items?.data?.[0]?.price?.id !== subscription.items.data[0]?.price?.id) {
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_PLAN_CHANGED',
          details: {
            subscriptionId: subscription.id,
            oldPriceId: previousAttributes.items?.data?.[0]?.price?.id,
            newPriceId: subscription.items.data[0]?.price?.id,
          },
        },
      })

      console.log(`サブスクリプションプラン変更: ${subscription.id}`)
    }

    // キャンセル予定が設定された場合
    if (!previousAttributes?.cancel_at_period_end && subscription.cancel_at_period_end) {
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_CANCEL_SCHEDULED',
          details: {
            subscriptionId: subscription.id,
            cancelAt: subscription.current_period_end,
          },
        },
      })

      console.log(`サブスクリプションキャンセル予定: ${subscription.id}`)
    }

    // キャンセル予定が取り消された場合
    if (previousAttributes?.cancel_at_period_end && !subscription.cancel_at_period_end) {
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_CANCEL_REVERTED',
          details: {
            subscriptionId: subscription.id,
          },
        },
      })

      console.log(`サブスクリプションキャンセル取り消し: ${subscription.id}`)
    }
  } catch (error) {
    console.error('サブスクリプション更新処理エラー:', error)
    throw error
  }
}

// サブスクリプション削除イベント
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('サブスクリプションにユーザーIDが見つかりません:', subscription.id)
    return
  }

  try {
    // サブスクリプション削除
    await prisma.subscription.delete({
      where: { stripeSubscriptionId: subscription.id },
    })

    // ユーザーをフリープランに変更
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: SubscriptionPlan.FREE,
      },
    })

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_DELETED',
        details: {
          subscriptionId: subscription.id,
          deletedAt: new Date(),
        },
      },
    })

    console.log(`サブスクリプション削除完了: ${subscription.id} (User: ${userId})`)
  } catch (error) {
    console.error('サブスクリプション削除処理エラー:', error)
    throw error
  }
}

// 支払い成功イベント
async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice

  if (!invoice.subscription) {
    console.log('サブスクリプション以外の支払い成功:', invoice.id)
    return
  }

  try {
    // 顧客情報からユーザーIDを取得
    let userId: string | undefined

    if (typeof invoice.customer === 'string') {
      const customer = await StripeService.stripe.customers.retrieve(invoice.customer)
      userId = (customer as Stripe.Customer).metadata?.userId
    }

    if (!userId) {
      console.error('請求書に関連するユーザーIDが見つかりません:', invoice.id)
      return
    }

    // 支払い記録をデータベースに保存
    await prisma.paymentHistory.create({
      data: {
        userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        paidAt: new Date(
          (invoice.status_transitions?.paid_at || Math.floor(Date.now() / 1000)) * 1000
        ),
        description: invoice.description || 'Subscription payment',
      },
    })

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'PAYMENT_SUCCEEDED',
        details: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
        },
      },
    })

    console.log(
      `支払い成功: ${invoice.id} (User: ${userId}, Amount: ${invoice.amount_paid} ${invoice.currency})`
    )
  } catch (error) {
    console.error('支払い成功処理エラー:', error)
    throw error
  }
}

// 支払い失敗イベント
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice

  if (!invoice.subscription) {
    console.log('サブスクリプション以外の支払い失敗:', invoice.id)
    return
  }

  try {
    // 顧客情報からユーザーIDを取得
    let userId: string | undefined

    if (typeof invoice.customer === 'string') {
      const customer = await StripeService.stripe.customers.retrieve(invoice.customer)
      userId = (customer as Stripe.Customer).metadata?.userId
    }

    if (!userId) {
      console.error('請求書に関連するユーザーIDが見つかりません:', invoice.id)
      return
    }

    // 支払い失敗記録をデータベースに保存
    await prisma.paymentHistory.create({
      data: {
        userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        failedAt: new Date(),
        description: invoice.description || 'Subscription payment',
      },
    })

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'PAYMENT_FAILED',
        details: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count,
        },
      },
    })

    // 支払い失敗通知メール送信（実装に応じて）
    // await sendPaymentFailedEmail(userId, invoice)

    console.log(
      `支払い失敗: ${invoice.id} (User: ${userId}, Amount: ${invoice.amount_due} ${invoice.currency})`
    )
  } catch (error) {
    console.error('支払い失敗処理エラー:', error)
    throw error
  }
}

// トライアル期間終了予告イベント
async function handleTrialWillEnd(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('サブスクリプションにユーザーIDが見つかりません:', subscription.id)
    return
  }

  try {
    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'TRIAL_WILL_END',
        details: {
          subscriptionId: subscription.id,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        },
      },
    })

    // トライアル終了予告メール送信（実装に応じて）
    // await sendTrialEndingEmail(userId, subscription)

    console.log(`トライアル終了予告: ${subscription.id} (User: ${userId})`)
  } catch (error) {
    console.error('トライアル終了予告処理エラー:', error)
    throw error
  }
}

// 支払い方法追加イベント
async function handlePaymentMethodAttached(event: Stripe.Event): Promise<void> {
  const paymentMethod = event.data.object as Stripe.PaymentMethod

  try {
    // 顧客情報からユーザーIDを取得
    let userId: string | undefined

    if (paymentMethod.customer && typeof paymentMethod.customer === 'string') {
      const customer = await StripeService.stripe.customers.retrieve(paymentMethod.customer)
      userId = (customer as Stripe.Customer).metadata?.userId
    }

    if (!userId) {
      console.log('支払い方法に関連するユーザーIDが見つかりません:', paymentMethod.id)
      return
    }

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'PAYMENT_METHOD_ATTACHED',
        details: {
          paymentMethodId: paymentMethod.id,
          type: paymentMethod.type,
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
        },
      },
    })

    console.log(`支払い方法追加: ${paymentMethod.id} (User: ${userId})`)
  } catch (error) {
    console.error('支払い方法追加処理エラー:', error)
    throw error
  }
}

// PaymentIntent成功イベント
async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const userId = paymentIntent.metadata?.userId

  if (!userId) {
    console.log('PaymentIntentにユーザーIDが見つかりません:', paymentIntent.id)
    return
  }

  try {
    // 単発支払い記録をデータベースに保存
    await prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        paidAt: new Date(),
        description: paymentIntent.description || 'One-time payment',
      },
    })

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'PAYMENT_INTENT_SUCCEEDED',
        details: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      },
    })

    console.log(`PaymentIntent成功: ${paymentIntent.id} (User: ${userId})`)
  } catch (error) {
    console.error('PaymentIntent成功処理エラー:', error)
    throw error
  }
}

// PaymentIntent失敗イベント
async function handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const userId = paymentIntent.metadata?.userId

  if (!userId) {
    console.log('PaymentIntentにユーザーIDが見つかりません:', paymentIntent.id)
    return
  }

  try {
    // 支払い失敗記録
    await prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'failed',
        failedAt: new Date(),
        description: paymentIntent.description || 'One-time payment',
      },
    })

    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'PAYMENT_INTENT_FAILED',
        details: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          lastPaymentError: paymentIntent.last_payment_error,
        },
      },
    })

    console.log(`PaymentIntent失敗: ${paymentIntent.id} (User: ${userId})`)
  } catch (error) {
    console.error('PaymentIntent失敗処理エラー:', error)
    throw error
  }
}

// SetupIntent成功イベント（将来の支払いのための支払い方法設定）
async function handleSetupIntentSucceeded(event: Stripe.Event): Promise<void> {
  const setupIntent = event.data.object as Stripe.SetupIntent
  const userId = setupIntent.metadata?.userId

  if (!userId) {
    console.log('SetupIntentにユーザーIDが見つかりません:', setupIntent.id)
    return
  }

  try {
    // アクティビティログ記録
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'SETUP_INTENT_SUCCEEDED',
        details: {
          setupIntentId: setupIntent.id,
          paymentMethodId: setupIntent.payment_method,
        },
      },
    })

    console.log(`SetupIntent成功: ${setupIntent.id} (User: ${userId})`)
  } catch (error) {
    console.error('SetupIntent成功処理エラー:', error)
    throw error
  }
}

// WebHook再処理機能（失敗時のリトライ用）
export async function retryWebHookEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Stripeからイベントを再取得
    const event = await StripeService.stripe.events.retrieve(eventId)

    const handler = eventHandlers[event.type as StripeWebHookEvent]

    if (!handler) {
      return { success: false, error: `Unsupported event type: ${event.type}` }
    }

    await handler(event)

    console.log(`WebHookイベント再処理完了: ${event.type} (${eventId})`)
    return { success: true }
  } catch (error) {
    console.error('WebHookイベント再処理エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// WebHook処理状況のログ取得
export async function getWebHookLogs(limit: number = 50): Promise<
  Array<{
    eventId: string
    eventType: string
    status: 'success' | 'failed'
    processedAt: Date
    error?: string
  }>
> {
  try {
    // 実際の実装では、WebHookイベントの処理ログをデータベースに記録し、
    // それを取得する仕組みを構築する
    const activities = await prisma.userActivity.findMany({
      where: {
        action: {
          in: [
            'SUBSCRIPTION_CREATED',
            'SUBSCRIPTION_UPDATED',
            'PAYMENT_SUCCEEDED',
            'PAYMENT_FAILED',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return activities.map((activity) => ({
      eventId: activity.id,
      eventType: activity.action,
      status: 'success' as const,
      processedAt: activity.createdAt,
    }))
  } catch (error) {
    console.error('WebHookログ取得エラー:', error)
    return []
  }
}

export default handleStripeWebHook
