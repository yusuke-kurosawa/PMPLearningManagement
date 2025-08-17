/**
 * バックエンドサービス実装
 * Developer 2: サーバーサイド・API基盤
 * 技術スタック: tRPC, Prisma
 * セキュリティレベル: High
 * 最終更新: {updated}
 */
import { router } from '@/server/trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { learningRouter } from './learning'
import { examRouter } from './exam'
import { pmbokRouter } from './pmbok'
import { groupRouter } from './group'
import { noteRouter } from './note'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  learning: learningRouter,
  exam: examRouter,
  pmbok: pmbokRouter,
  group: groupRouter,
  note: noteRouter,
})

export type AppRouter = typeof appRouter
