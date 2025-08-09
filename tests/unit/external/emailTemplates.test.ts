import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emailService } from '@/server/services/emailService';
import { emailTemplateEngine } from '@/server/services/emailTemplateEngine';
import { notificationService } from '@/server/services/notificationService';
import { prisma } from '@/tests/setup/globalSetup';
import { faker } from '@faker-js/faker';
import nodemailer from 'nodemailer';

/**
 * メール配信・テンプレートエンジンテスト
 * 担当：統合・外部APIチーム
 * 
 * テストカバレッジ：
 * - メールテンプレート生成
 * - 多言語対応メール
 * - メール配信エラーハンドリング
 * - バルクメール送信
 * - プッシュ通知統合
 */

describe('Email Service - Template Generation', () => {
  let testUser: any;
  let mockTransporter: any;

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'PREMIUM_USER',
        subscription: 'PREMIUM',
        language: 'ja',
        emailPreferences: {
          marketing: true,
          progress: true,
          reminders: true
        }
      }
    });

    // メールトランスポーターモック
    mockTransporter = {
      sendMail: vi.fn().mockResolvedValue({
        messageId: faker.string.uuid(),
        response: '250 2.0.0 OK',
        accepted: [testUser.email],
        rejected: [],
        pending: []
      })
    };

    vi.mocked(nodemailer.createTransporter).mockReturnValue(mockTransporter);
  });

  describe('Welcome Email Templates', () => {
    it('should generate welcome email for new premium user', async () => {
      const emailData = {
        userName: testUser.name,
        userEmail: testUser.email,
        subscriptionPlan: 'PREMIUM',
        welcomeBonus: {
          freeExams: 5,
          premiumContent: true,
          mentorAccess: true
        }
      };

      const result = await emailService.sendWelcomeEmail(testUser.email, emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();

      // メール内容の検証
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.stringContaining('@pmpmanagementsystem.com'),
        to: testUser.email,
        subject: expect.stringContaining('ようこそ'), // 日本語
        html: expect.stringContaining(testUser.name),
        text: expect.any(String),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'pmp-study-guide.pdf',
            path: expect.stringContaining('/assets/study-guide.pdf')
          })
        ])
      });
    });

    it('should generate welcome email for free user', async () => {
      const freeUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: 'FREE_USER',
          subscription: 'FREE',
          language: 'ja'
        }
      });

      const emailData = {
        userName: freeUser.name,
        subscriptionPlan: 'FREE',
        upgradeIncentives: {
          discountCode: 'WELCOME20',
          limitedExams: 2,
          upgradeUrl: 'https://example.com/upgrade'
        }
      };

      const result = await emailService.sendWelcomeEmail(freeUser.email, emailData);

      expect(result.success).toBe(true);

      // フリーユーザー向けのアップグレード促進コンテンツが含まれる
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('WELCOME20'),
          html: expect.stringContaining('アップグレード')
        })
      );
    });

    it('should handle multi-language welcome emails', async () => {
      const englishUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: 'PREMIUM_USER',
          language: 'en'
        }
      });

      const emailData = {
        userName: englishUser.name,
        subscriptionPlan: 'PREMIUM'
      };

      await emailService.sendWelcomeEmail(englishUser.email, emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Welcome'), // 英語
          html: expect.stringContaining('Welcome to PMP Learning Management')
        })
      );
    });

    it('should include personalized learning path in welcome email', async () => {
      const emailData = {
        userName: testUser.name,
        subscriptionPlan: 'PREMIUM',
        personalizedPath: {
          estimatedCompletionWeeks: 12,
          recommendedWeeklyHours: 8,
          focusAreas: ['Integration', 'Scope', 'Schedule'],
          nextMilestone: 'Complete Foundation Modules'
        }
      };

      await emailService.sendWelcomeEmail(testUser.email, emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('12週間'),
          html: expect.stringContaining('週8時間'),
          html: expect.stringContaining('統合管理')
        })
      );
    });
  });

  describe('Progress Notification Templates', () => {
    it('should generate weekly progress report', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-3', masteryLevel: 90, studyTime: 1800, lastStudied: new Date() }
        ]
      });

      const progressData = {
        weekPeriod: '2024年1月第2週',
        studyTime: 7800, // 秒
        processesStudied: 3,
        averageMastery: 83.3,
        streak: 5,
        achievements: [
          { title: 'ストリーク達成', description: '5日連続学習' },
          { title: 'マスタリー向上', description: '統合管理90%達成' }
        ],
        nextWeekGoals: [
          'スケジュール管理プロセスの学習',
          '模擬試験1回受験'
        ]
      };

      const result = await emailService.sendWeeklyProgressReport(testUser.email, progressData);

      expect(result.success).toBe(true);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('週間学習レポート'),
          html: expect.stringContaining('2.2時間'), // 7800秒 = 2.2時間
          html: expect.stringContaining('83.3%'),
          html: expect.stringContaining('5日連続')
        })
      );
    });

    it('should generate milestone achievement notification', async () => {
      const milestoneData = {
        milestone: '統合管理完全習得',
        achievementDate: new Date(),
        nextMilestone: 'スコープ管理開始',
        progress: {
          overall: 35,
          knowledgeArea: 'INTEGRATION',
          completedProcesses: 7
        },
        badge: {
          name: '統合マスター',
          imageUrl: '/badges/integration-master.png'
        }
      };

      await emailService.sendMilestoneAchievement(testUser.email, milestoneData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('マイルストーン達成'),
          html: expect.stringContaining('統合管理完全習得'),
          html: expect.stringContaining('統合マスター'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'achievement-badge.png',
              path: expect.stringContaining('/badges/integration-master.png')
            })
          ])
        })
      );
    });

    it('should generate learning reminder for inactive users', async () => {
      // 7日間学習していないユーザー
      const inactiveDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await prisma.learningProgress.create({
        data: {
          userId: testUser.id,
          processId: 'process-1',
          masteryLevel: 60,
          studyTime: 3600,
          lastStudied: inactiveDate
        }
      });

      const reminderData = {
        daysSinceLastStudy: 7,
        lastProgress: {
          process: 'プロジェクト統合管理',
          masteryLevel: 60
        },
        encouragement: {
          tip: '1日15分の短時間学習から再開しましょう',
          quickContent: [
            '統合管理の復習クイズ（5分）',
            'プロジェクト憲章の動画（10分）'
          ]
        },
        streakBonusAvailable: true
      };

      await emailService.sendLearningReminder(testUser.email, reminderData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('学習を再開'),
          html: expect.stringContaining('7日'),
          html: expect.stringContaining('15分'),
          html: expect.stringContaining('復習クイズ')
        })
      );
    });

    it('should not send reminder if user opted out', async () => {
      // リマインダーを無効にしたユーザー
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          emailPreferences: {
            marketing: true,
            progress: true,
            reminders: false // リマインダー無効
          }
        }
      });

      const reminderData = { daysSinceLastStudy: 7 };

      const result = await emailService.sendLearningReminder(testUser.email, reminderData);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe('User opted out of reminders');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('Payment and Subscription Templates', () => {
    it('should generate payment success notification', async () => {
      const paymentData = {
        amount: 2999,
        currency: 'JPY',
        transactionId: 'txn_123456789',
        date: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        invoiceUrl: 'https://billing.stripe.com/invoice/123',
        plan: 'PREMIUM'
      };

      await emailService.sendPaymentSuccessNotification(testUser.email, paymentData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('お支払い完了'),
          html: expect.stringContaining('¥2,999'),
          html: expect.stringContaining('txn_123456789'),
          html: expect.stringContaining('PREMIUM')
        })
      );
    });

    it('should generate payment failure notification', async () => {
      const failureData = {
        amount: 2999,
        currency: 'JPY',
        failureReason: 'カードが無効です',
        nextRetryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        updatePaymentUrl: 'https://billing.example.com/update-payment',
        gracePeriodDays: 7
      };

      await emailService.sendPaymentFailureNotification(testUser.email, failureData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('お支払いに問題'),
          html: expect.stringContaining('カードが無効'),
          html: expect.stringContaining('7日間'),
          html: expect.stringContaining('更新してください')
        })
      );
    });

    it('should generate subscription cancellation confirmation', async () => {
      const cancellationData = {
        plan: 'PREMIUM',
        cancellationDate: new Date(),
        accessEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        refundAmount: 1000,
        cancellationReason: 'ユーザーリクエスト',
        reactivationUrl: 'https://billing.example.com/reactivate'
      };

      await emailService.sendCancellationConfirmation(testUser.email, cancellationData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('解約確認'),
          html: expect.stringContaining('PREMIUM'),
          html: expect.stringContaining('¥1,000'),
          html: expect.stringContaining('再開する')
        })
      );
    });

    it('should handle subscription upgrade notification', async () => {
      const upgradeData = {
        oldPlan: 'FREE',
        newPlan: 'PREMIUM',
        upgradeDate: new Date(),
        newFeatures: [
          '無制限の模擬試験',
          'プレミアムコンテンツアクセス',
          '1対1メンタリング',
          'カスタム学習プラン'
        ],
        proratedAmount: 2499,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await emailService.sendUpgradeConfirmation(testUser.email, upgradeData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('アップグレード完了'),
          html: expect.stringContaining('FREE → PREMIUM'),
          html: expect.stringContaining('無制限の模擬試験'),
          html: expect.stringContaining('¥2,499')
        })
      );
    });
  });

  describe('Exam and Assessment Templates', () => {
    it('should generate exam completion notification', async () => {
      const examData = {
        examTitle: 'PMP実践模擬試験#3',
        score: 78,
        passingScore: 70,
        passed: true,
        completionTime: 195, // 分
        correctAnswers: 140,
        totalQuestions: 180,
        knowledgeAreaBreakdown: {
          'INTEGRATION': { score: 85, questions: 36 },
          'SCOPE': { score: 72, questions: 18 },
          'SCHEDULE': { score: 80, questions: 27 }
        },
        recommendedStudyAreas: ['コスト管理', 'リスク管理'],
        nextExamRecommendation: 'PMP実践模擬試験#4'
      };

      await emailService.sendExamCompletionNotification(testUser.email, examData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('試験完了'),
          html: expect.stringContaining('78%'),
          html: expect.stringContaining('140/180'),
          html: expect.stringContaining('3時間15分'),
          html: expect.stringContaining('合格おめでとう')
        })
      );
    });

    it('should generate exam failure notification with encouragement', async () => {
      const failureData = {
        examTitle: 'PMP実践模擬試験#1',
        score: 62,
        passingScore: 70,
        passed: false,
        improvementNeeded: 8,
        weakAreas: [
          { area: 'コスト管理', score: 45, improvement: '25ポイント向上が必要' },
          { area: 'リスク管理', score: 55, improvement: '15ポイント向上が必要' }
        ],
        studyRecommendations: [
          'コスト管理プロセスの復習動画（2時間）',
          'リスク識別フラッシュカード（30分/日 x 7日）',
          'プラクティステスト（毎週1回）'
        ],
        nextExamDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await emailService.sendExamFailureNotification(testUser.email, failureData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('再挑戦'),
          html: expect.stringContaining('62%'),
          html: expect.stringContaining('あと8ポイント'),
          html: expect.stringContaining('諦めずに'),
          html: expect.stringContaining('コスト管理プロセス')
        })
      );
    });

    it('should generate exam reminder notification', async () => {
      const reminderData = {
        examTitle: 'PMP本試験',
        examDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        examTime: '09:00',
        venue: 'Prometric Testing Center Tokyo',
        address: '東京都港区六本木1-2-3',
        preparationChecklist: [
          '身分証明書の確認',
          '試験会場への交通手段確認',
          '最終復習（弱点分野）',
          '十分な睡眠'
        ],
        lastMinuteTips: [
          '試験開始前に深呼吸',
          '分からない問題はスキップして後で戻る',
          '時間配分に注意（問題あたり73秒）'
        ]
      };

      await emailService.sendExamReminderNotification(testUser.email, reminderData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('試験前日'),
          html: expect.stringContaining('3日後'),
          html: expect.stringContaining('Prometric'),
          html: expect.stringContaining('身分証明書'),
          html: expect.stringContaining('深呼吸')
        })
      );
    });
  });

  describe('Bulk Email Operations', () => {
    it('should send bulk announcement to all premium users', async () => {
      const premiumUsers = await Promise.all(
        Array.from({ length: 50 }, async () => {
          return prisma.user.create({
            data: {
              id: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
              role: 'PREMIUM_USER',
              subscription: 'PREMIUM',
              language: 'ja'
            }
          });
        })
      );

      const announcementData = {
        title: '新機能リリース: AIパーソナライズド学習',
        content: `
          <h2>PMPlearning管理システムに新機能が追加されました！</h2>
          <ul>
            <li>AI駆動のパーソナライズド学習プラン</li>
            <li>リアルタイム学習アドバイス</li>
            <li>インテリジェント復習スケジュール</li>
          </ul>
        `,
        ctaText: '新機能を試す',
        ctaUrl: 'https://pmplearning.com/ai-features',
        unsubscribeUrl: 'https://pmplearning.com/unsubscribe'
      };

      const batchSize = 10;
      const result = await emailService.sendBulkAnnouncement(
        premiumUsers.map(u => u.email),
        announcementData,
        { batchSize }
      );

      expect(result.success).toBe(true);
      expect(result.totalSent).toBe(50);
      expect(result.failed.length).toBe(0);
      expect(result.batches).toBe(5); // 50/10 = 5バッチ

      // バッチごとに適切な間隔で送信されている
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(50);
    });

    it('should handle partial failures in bulk email', async () => {
      const mixedUsers = [
        testUser.email,
        'invalid-email@invalid-domain.invalid',
        faker.internet.email(),
        'another-invalid@test.invalid'
      ];

      // 無効なメールアドレスで送信失敗をシミュレート
      mockTransporter.sendMail = vi.fn().mockImplementation((mailOptions) => {
        if (mailOptions.to.includes('invalid')) {
          return Promise.reject(new Error('Invalid email address'));
        }
        return Promise.resolve({
          messageId: faker.string.uuid(),
          accepted: [mailOptions.to],
          rejected: []
        });
      });

      const result = await emailService.sendBulkAnnouncement(mixedUsers, {
        title: 'テスト告知',
        content: 'テスト内容'
      });

      expect(result.success).toBe(false); // 部分的失敗
      expect(result.totalSent).toBe(2); // 有効なアドレス2件
      expect(result.failed.length).toBe(2); // 無効なアドレス2件
      expect(result.failed[0].email).toContain('invalid');
      expect(result.failed[0].error).toBe('Invalid email address');
    });

    it('should respect rate limiting in bulk operations', async () => {
      const manyUsers = Array.from({ length: 100 }, () => faker.internet.email());

      const startTime = Date.now();
      await emailService.sendBulkAnnouncement(manyUsers, {
        title: 'レート制限テスト',
        content: 'コンテンツ'
      }, {
        batchSize: 10,
        delayBetweenBatches: 1000 // 1秒間隔
      });
      const endTime = Date.now();

      const expectedMinTime = 9 * 1000; // 9バッチの間隔 = 9秒
      expect(endTime - startTime).toBeGreaterThanOrEqual(expectedMinTime);
    });
  });

  describe('Template Engine Features', () => {
    it('should support conditional content rendering', async () => {
      const templateData = {
        user: {
          name: testUser.name,
          isPremium: true,
          trialDaysLeft: null
        },
        content: {
          showUpgradeOffer: false,
          showPremiumFeatures: true
        }
      };

      const html = await emailTemplateEngine.render('welcome', templateData);

      expect(html).toContain('プレミアム機能'); // Premium content shown
      expect(html).not.toContain('アップグレード'); // Upgrade offer hidden
      expect(html).not.toContain('トライアル'); // Trial content hidden
    });

    it('should support loops in templates', async () => {
      const templateData = {
        achievements: [
          { title: '初回ログイン', date: '2024-01-15' },
          { title: 'ストリーク7日', date: '2024-01-21' },
          { title: '統合管理完了', date: '2024-01-28' }
        ]
      };

      const html = await emailTemplateEngine.render('achievements', templateData);

      expect(html).toContain('初回ログイン');
      expect(html).toContain('ストリーク7日');
      expect(html).toContain('統合管理完了');
      expect(html).toContain('2024-01-15');
      expect(html).toContain('2024-01-21');
      expect(html).toContain('2024-01-28');
    });

    it('should support date and number formatting', async () => {
      const templateData = {
        exam: {
          date: new Date('2024-02-15T09:00:00+09:00'),
          score: 78.5,
          duration: 195, // 分
          fee: 55500 // 円
        }
      };

      const html = await emailTemplateEngine.render('exam-result', templateData);

      expect(html).toContain('2024年2月15日');
      expect(html).toContain('78.5%');
      expect(html).toContain('3時間15分');
      expect(html).toContain('¥55,500');
    });

    it('should handle missing template gracefully', async () => {
      const result = await emailService.sendTemplatedEmail(
        testUser.email,
        'non-existent-template',
        { user: testUser.name }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');
    });

    it('should validate template data against schema', async () => {
      // 必須フィールドが欠けているデータ
      const incompleteData = {
        // userNameが欠けている
        subscriptionPlan: 'PREMIUM'
      };

      const result = await emailService.sendWelcomeEmail(testUser.email, incompleteData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field: userName');
    });

    it('should support A/B testing for email templates', async () => {
      const testGroup = await emailService.sendTemplatedEmail(
        testUser.email,
        'welcome-v2', // A/Bテスト版
        {
          userName: testUser.name,
          testVariant: 'B',
          trackingId: 'ab-test-welcome-123'
        }
      );

      expect(testGroup.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('utm_campaign=ab-test-welcome-123'),
          headers: {
            'X-Test-Variant': 'B',
            'X-Tracking-ID': 'ab-test-welcome-123'
          }
        })
      );
    });
  });

  describe('Email Delivery and Error Handling', () => {
    it('should handle SMTP connection failure', async () => {
      mockTransporter.sendMail = vi.fn().mockRejectedValue(new Error('SMTP connection timeout'));

      const result = await emailService.sendWelcomeEmail(testUser.email, {
        userName: testUser.name
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('SMTP connection timeout');

      // 失敗したメールがリトライキューに追加される
      const retryRecord = await prisma.emailRetryQueue.findFirst({
        where: { 
          recipientEmail: testUser.email,
          templateName: 'welcome'
        }
      });
      expect(retryRecord).toBeTruthy();
    });

    it('should implement exponential backoff for failed emails', async () => {
      // 既存のリトライレコード（2回失敗済み）
      await prisma.emailRetryQueue.create({
        data: {
          recipientEmail: testUser.email,
          templateName: 'welcome',
          templateData: JSON.stringify({ userName: testUser.name }),
          retryCount: 2,
          nextRetry: new Date(Date.now() - 1000), // リトライ可能
          lastError: 'Previous failure'
        }
      });

      mockTransporter.sendMail = vi.fn().mockRejectedValue(new Error('Still failing'));

      const result = await emailService.retryFailedEmails();

      // リトライカウント増加と次回リトライ時間の延長
      const updatedRetry = await prisma.emailRetryQueue.findFirst({
        where: { recipientEmail: testUser.email }
      });
      
      expect(updatedRetry?.retryCount).toBe(3);
      expect(updatedRetry?.nextRetry.getTime()).toBeGreaterThan(Date.now() + 5 * 60 * 1000); // 5分以上後
    });

    it('should handle bounce notifications', async () => {
      const bounceNotification = {
        messageId: 'msg_123456',
        bounceType: 'permanent',
        bounceSubType: 'general',
        bounceRecipients: [testUser.email],
        timestamp: new Date()
      };

      await emailService.processBounceNotification(bounceNotification);

      // ユーザーのメール配信を停止
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(updatedUser?.emailDeliveryStatus).toBe('BOUNCED');

      // バウンス記録を作成
      const bounceRecord = await prisma.emailBounce.findFirst({
        where: { email: testUser.email }
      });
      expect(bounceRecord?.bounceType).toBe('PERMANENT');
    });

    it('should respect unsubscribe preferences', async () => {
      // ユーザーがマーケティングメールを拒否
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          emailPreferences: {
            marketing: false,
            progress: true,
            reminders: true
          }
        }
      });

      const result = await emailService.sendMarketingEmail(testUser.email, {
        title: 'マーケティングメール',
        content: '宣伝内容'
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe('User unsubscribed from marketing emails');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should track email open and click rates', async () => {
      const trackingData = {
        campaignId: 'campaign-123',
        userId: testUser.id,
        trackOpenPixel: true,
        trackClickUrls: true
      };

      await emailService.sendWelcomeEmail(testUser.email, {
        userName: testUser.name,
        ...trackingData
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('open-tracking.png?campaign=campaign-123'),
          html: expect.stringContaining('track-click?url=')
        })
      );
    });
  });
});